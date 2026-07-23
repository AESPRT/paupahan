'use server'

import prisma from '@/src/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getUnitsData() {
  try {
    const unitsList = await prisma.unit.findMany({
      include: {
        property: { select: { name: true, city: true, addressLine: true } },
        rooms: {
          include: {
            leases: {
              where: { status: 'active' },
              include: {
                tenant: { select: { fullName: true } },
              },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formattedUnits = unitsList.map((unit) => {
      const formattedRooms = unit.rooms.map((room) => {
        const activeLease = room.leases[0];
        let status: "Occupied" | "Vacant" | "Maintenance" = "Vacant";
        if (room.status === 'occupied') status = "Occupied";
        else if (room.status === 'maintenance') status = "Maintenance";

        return {
          id: room.id,
          roomNumber: room.roomNumber,
          status,
          monthlyRent: Number(room.monthlyRent),
          tenantName: activeLease?.tenant?.fullName,
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
    // 1. Hanapin muna ang unang available na Property sa database
    let property = await prisma.property.findFirst();

    // 2. Kung walang property, kailangan nating kumuha ng Landlord para maikonekta ito
    if (!property) {
      const landlordUser = await prisma.user.findFirst({
        where: { 
          OR: [
            { role: 'staff' },
            { role: 'landlord' }
          ]
        }
      });

      if (!landlordUser) {
        return { success: false, error: 'Walang nahanap na Landlord o Admin account sa database para magmay-ari ng Property.' };
      }

      property = await prisma.property.create({
        data: {
          name: "Pangunahing Gusali",
          addressLine: "Main Address",
          city: "Manila",
          landlordId: landlordUser.id,
        } as any,
      });
    }

    // 3. I-create na ang Unit sa ilalim ng nahanap o ginawang Property
    await prisma.unit.create({
      data: {
        propertyId: property.id,
        name,
      },
    })
    
    revalidatePath('/admin/dashboard/units')
    return { success: true }
  } catch (error) {
    console.error('Error adding unit:', error);
    return { success: false, error: 'May naganap na error sa pagdagdag ng unit/building.' }
  }
}

export async function addRoomAction(propertyOrUnitId: string, roomNumber: string, monthlyRent: number) {
  try {
    let targetUnitId = propertyOrUnitId;

    // 1. Suriin muna kung ang ID na ipinasa ay direktang isang Unit ID
    const unitExists = await prisma.unit.findUnique({
      where: { id: propertyOrUnitId },
    });

    // 2. Kung HINDI unit ang ID na ito, baka ito ay isang Property ID
    if (!unitExists) {
      const propertyExists = await prisma.property.findUnique({
        where: { id: propertyOrUnitId },
      });

      if (!propertyExists) {
        return { success: false, error: 'Hindi natagpuan ang Unit o Property na ito.' };
      }

      // Hanapin kung mayroon nang Unit sa ilalim ng Property na ito
      let unit = await prisma.unit.findFirst({
        where: { propertyId: propertyOrUnitId },
      });

      // Kung wala pang Unit sa ilalim ng property na ito, gumawa muna tayo ng default unit
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

    // 3. I-create na ang Room gamit ang tamang targetUnitId
    await prisma.room.create({
      data: {
        unitId: targetUnitId,
        roomNumber,
        monthlyRent,
        status: 'vacant',
      },
    })
    
    revalidatePath('/admin/dashboard/units')
    return { success: true }
  } catch (error) {
    console.error('Error adding room:', error);
    return { success: false, error: 'May naganap na error sa pagdagdag ng kwarto. Baka pareho ang numero ng kwarto sa unit na ito.' }
  }
}