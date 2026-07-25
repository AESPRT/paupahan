'use server'

import prisma from '@/src/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createAuditLog } from '@/src/actions/audit-actions'
import { checkUserSubscriptionLimits } from "@/src/actions/subscription-actions";

export async function getUnitsData() {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('session_user_id')?.value;

    if (!adminId) {
      return [];
    }

    // 1. Kunin muna ang mga property ID na pagmamay-ari ng naka-login na landlord
    const landlordProperties = await prisma.property.findMany({
      where: { landlordId: adminId },
      select: { id: true },
    });
    const propertyIds = landlordProperties.map((p) => p.id);

    if (propertyIds.length === 0) {
      return [];
    }

    // 2. Kunin lamang ang mga unit sa ilalim ng mga property ng landlord na ito
    const unitsList = await prisma.unit.findMany({
      where: { propertyId: { in: propertyIds } },
      include: {
        property: { select: { name: true, city: true, addressLine: true } },
        rooms: {
          include: {
            leases: {
              where: { 
                status: { in: ['active', 'pending'] } 
              },
              include: {
                tenant: { select: { fullName: true } },
              },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedUnits = unitsList.map((unit) => {
      const formattedRooms = unit.rooms.map((room) => {
        const activeOrPendingLease = room.leases[0];
        
        let status: "Occupied" | "Vacant" | "Maintenance" | "Reserved" = "Vacant";
        
        if (room.status === 'maintenance') {
          status = "Maintenance";
        } else if (activeOrPendingLease) {
          status = activeOrPendingLease.status === 'pending' ? "Reserved" : "Occupied";
        } else if (room.status === 'occupied') {
          status = "Occupied";
        }

        return {
          id: room.id,
          roomNumber: room.roomNumber,
          status,
          monthlyRent: Number(room.monthlyRent),
          tenantName: activeOrPendingLease?.tenant?.fullName,
        };
      });

      return {
        id: unit.id,
        name: `${unit.property.name} - ${unit.name}`,
        address: `${unit.property.addressLine}, ${unit.property.city}`,
        totalRooms: formattedRooms.length,
        rooms: formattedRooms,
      };
    });

    return formattedUnits;
  } catch (error) {
    console.error('Error fetching units data:', error);
    return [];
  }
}

export async function addUnitAction(name: string) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("session_user_id")?.value;
    
    if (!adminId) {
      return { success: false, error: "Walang active session." };
    }

    // 1. Suriin ang subscription limits ng user
    const limits = await checkUserSubscriptionLimits();
    
    // 🛑 DITO ANG PAGBABAGO: Kapag hindi na kaya magdagdag (umabot na sa max units), harangin agad anuman ang plan!
    if (!limits.canAddMoreUnits) {
      return { 
        success: false, 
        error: `Naabot mo na ang limit ng iyong plan (${limits.planDisplayName}: ${limits.maxUnitsDisplay}). Mag-upgrade para makapagdagdag pa ng unit!` 
      };
    }

    // 1. Hanapin muna kung mayroon nang property ang landlord na ito
    let property = await prisma.property.findFirst({
      where: { landlordId: adminId },
    });

    // 2. Kung wala pang property ang landlord na ito, gawan siya ng sariling property
    if (!property) {
      property = await prisma.property.create({
        data: {
          name: "Pangunahing Gusali",
          addressLine: "Main Address",
          city: "Manila",
          landlordId: adminId,
        },
      });
    }

    // 3. I-create ang Unit sa ilalim ng property ng landlord at i-save sa variable
    const newUnit = await prisma.unit.create({
      data: {
        propertyId: property.id,
        name: `${property.name} - ${name}`,
      },
      include: {
        rooms: true, // Para masigurong kasama ang rooms array sa return value
      },
    });

    await createAuditLog({
      actorId: adminId,
      action: `Gumawa ng bagong Unit/Building: ${name}`,
      entityType: 'Unit',
      entityId: newUnit.id, // Ginamit ang tunay na ID ng bagong unit
      metadata: { actionType: 'ADD' },
    });
    
    revalidatePath('/admin/dashboard/units');
    
    // Ibinabalik na ngayon ang success kasama ang mismong unit data mula sa DB
    return { success: true, unit: newUnit };
  } catch (error) {
    console.error('Error adding unit:', error);
    return { success: false, error: 'May naganap na error sa pagdagdag ng unit/building.' };
  }
}

export async function addRoomAction(propertyOrUnitId: string, roomNumber: string, monthlyRent: number) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("session_user_id")?.value;
    
    if (!adminId) {
      return { success: false, error: "Walang active session." };
    }

    const limits = await checkUserSubscriptionLimits();
    
    if (!limits.canAddMoreRooms) {
      return { 
        success: false, 
        error: `Naabot mo na ang limit ng iyong plan (${limits.planDisplayName}: ${limits.maxRoomLimit}). Mag-upgrade sa Standard o Pro para magdagdag pa!` 
      };
    }

    let targetUnitId = propertyOrUnitId;

    // 1. Suriin muna kung ang ID ay direktang isang Unit na pag-aari ng landlord
    const unitExists = await prisma.unit.findFirst({
      where: { 
        id: propertyOrUnitId,
        property: { landlordId: adminId }
      },
    });

    // 2. Kung hindi unit, baka ito ay isang Property ID ng landlord
    if (!unitExists) {
      const propertyExists = await prisma.property.findFirst({
        where: { 
          id: propertyOrUnitId,
          landlordId: adminId
        },
      });

      if (!propertyExists) {
        return { success: false, error: 'Hindi natagpuan ang Unit o Property o wala kang pahintulot dito.' };
      }

      // Hanapin kung mayroon nang Unit sa ilalim ng property na ito
      let unit = await prisma.unit.findFirst({
        where: { propertyId: propertyOrUnitId },
      });

      // Kung wala pa, gumawa muna ng default unit
      if (!unit) {
        unit = await prisma.unit.create({
          data: {
            propertyId: propertyOrUnitId,
            name: "Main Building / Unit",
          },
        });
      }

      targetUnitId = unit.id;
    }

    await createAuditLog({
      actorId: adminId,
      action: `Gumawa ng bagong Room: ${roomNumber} sa Unit/Property ID: ${propertyOrUnitId}`,
      entityType: 'Room',
      entityId: adminId,
      metadata: { actionType: 'ADD' },
    });

    // 3. I-create ang Room
    await prisma.room.create({
      data: {
        unitId: targetUnitId,
        roomNumber,
        monthlyRent,
        status: 'vacant',
      },
    });
    
    revalidatePath('/admin/dashboard/units');
    return { success: true };
  } catch (error) {
    console.error('Error adding room:', error);
    return { success: false, error: 'May naganap na error sa pagdagdag ng kwarto. Baka pareho ang numero ng kwarto sa unit na ito.' };
  }
}