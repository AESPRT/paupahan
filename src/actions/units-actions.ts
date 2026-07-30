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

    // 2. Kunin ang mga unit kasama ang rooms, leases, at ang mga detalye (floor, type, description)
    const unitsList = await prisma.unit.findMany({
      where: { propertyId: { in: propertyIds } },
      include: {
        property: { select: { name: true, city: true, addressLine: true } },
        leases: {
          where: {
            status: { in: ['active', 'pending'] }
          },
          include: {
            tenant: { select: { fullName: true } },
          },
          take: 1,
        },
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
      const activeOrPendingUnitLease = unit.leases[0];

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

      // Standardize floor and type values para laging may maayos na display
      const standardizedFloor = unit.floor && unit.floor.trim() !== "" ? unit.floor : "1st Floor";
      const standardizedType = unit.type && unit.type.trim() !== "" ? unit.type : "Studio";

      return {
        id: unit.id,
        name: unit.name,
        address: `${unit.property.addressLine}, ${unit.property.city}`,
        totalRooms: formattedRooms.length,
        rooms: formattedRooms,
        monthlyRent: Number(unit.monthlyRent || 0),
        unitStatus: unit.status,
        unitLeaseStatus: activeOrPendingUnitLease
          ? (activeOrPendingUnitLease.status === 'pending' ? ("Reserved" as const) : ("Occupied" as const))
          : ("Vacant" as const),
        unitTenantName: activeOrPendingUnitLease?.tenant?.fullName,

        // ✨ Siguradong standard at consistent ang mga values na ito sa UI
        floor: standardizedFloor,
        type: standardizedType,
        description: unit.description || "",
      };
    });

    return formattedUnits;
  } catch (error) {
    console.error('Error fetching units data:', error);
    return [];
  }
}

export async function addUnitAction(data: {
  unitName: string;
  monthlyRent: number;
  floor?: string; // 👈 Idagdag para sa floor
  type?: string;  // 👈 Idagdag para sa unit type
}) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("session_user_id")?.value;

    if (!adminId) {
      return { success: false, error: "Walang active session." };
    }

    // 1. Suriin ang subscription limits ng user
    const limits = await checkUserSubscriptionLimits();

    if (!limits.canAddMoreUnits) {
      return {
        success: false,
        error: `Naabot mo na ang limit ng iyong plan (${limits.planDisplayName}: ${limits.maxUnitsDisplay}). Mag-upgrade para makapagdagdag pa ng unit!`
      };
    }

    // 2. Hanapin muna kung mayroon nang property ang landlord na ito
    let property = await prisma.property.findFirst({
      where: { landlordId: adminId },
    });

    // 3. Kung wala pang property ang landlord na ito, gawan siya ng sariling property
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

    // 4. I-create ang Unit sa ilalim ng property kasama ang floor, type, at unitNumber para sa Hanap-Bahay
    const newUnit = await prisma.unit.create({
      data: {
        propertyId: property.id,
        name: data.unitName,
        unitNumber: data.unitName, // I-sync para madaling makuha sa marketplace details
        monthlyRent: data.monthlyRent,
        floor: data.floor || "1st Floor",
        type: data.type || "Studio",
        status: "vacant", // Naka-vacant default para lumabas agad sa Hanap-Bahay
      },
      include: {
        rooms: true,
      },
    });

    await createAuditLog({
      actorId: adminId,
      action: `Gumawa ng bagong Unit/Building: ${data.unitName}`,
      entityType: 'Unit',
      entityId: newUnit.id,
      metadata: { actionType: 'ADD' },
    });

    revalidatePath('/admin/dashboard/units');
    revalidatePath('/hanap-bahay');

    // ✨ I-convert ang Prisma Decimals patungong plain number para sa Client Component
    const serializedUnit = {
      ...newUnit,
      monthlyRent: newUnit.monthlyRent ? Number(newUnit.monthlyRent) : 0,
      rooms: newUnit.rooms.map(room => ({
        ...room,
        monthlyRent: room.monthlyRent ? Number(room.monthlyRent) : 0,
      })),
    };

    return { success: true, unit: serializedUnit };
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

export async function updateUnitAction(data: {
  id: string;
  name: string;
  monthlyRent: number;
  floor: string;
  type: string;
  description: string;
}) {
  try {
    const updated = await prisma.unit.update({
      where: { id: data.id },
      data: {
        name: data.name,
        monthlyRent: data.monthlyRent,
        floor: data.floor,
        type: data.type,
        description: data.description,
      },
    });

    // ✨ I-convert ang monthlyRent patungong plain number para maiwasan ang Decimal serialization error
    const formattedUnit = {
      ...updated,
      monthlyRent: updated.monthlyRent ? Number(updated.monthlyRent) : 0,
    };

    return { success: true, unit: formattedUnit };
  } catch (error) {
    console.error("Error updating unit:", error);
    return { success: false, error: "Hindi nai-save ang mga pagbabago sa unit." };
  }
}