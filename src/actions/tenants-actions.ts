'use server'

import prisma from '@/src/lib/prisma'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import { Tenant } from '@/src/types/tenant/tenant'
import { createAuditLog } from '@/src/actions/audit-actions'

export async function getTenantsData(): Promise<Tenant[]> {
  try {
    const cookieStore = await cookies()
    const adminId = cookieStore.get('session_user_id')?.value

    if (!adminId) {
      return []
    }

    // 1. Kunin muna ang mga property ID na pagmamay-ari ng naka-login na landlord
    const landlordProperties = await prisma.property.findMany({
      where: { landlordId: adminId },
      select: { id: true },
    })
    const propertyIds = landlordProperties.map((p) => p.id)

    if (propertyIds.length === 0) {
      return []
    }

    // 2. Kunin ang mga unit ID sa ilalim ng mga property na ito
    const landlordUnits = await prisma.unit.findMany({
      where: { propertyId: { in: propertyIds } },
      select: { id: true },
    })
    const unitIds = landlordUnits.map((u) => u.id)

    if (unitIds.length === 0) {
      return []
    }

    // 3. Kunin ang mga room ID sa ilalim ng mga unit na ito
    const landlordRooms = await prisma.room.findMany({
      where: { unitId: { in: unitIds } },
      select: { id: true },
    })
    const roomIds = landlordRooms.map((r) => r.id)

    // 4. Kunin ang mga lease na nakapaloob sa mga unit O sa mga room
    const leases = await prisma.lease.findMany({
      where: {
        OR: [
          { unitId: { in: unitIds } },
          ...(roomIds.length > 0 ? [{ roomId: { in: roomIds } }] : []),
        ],
      },
      include: {
        tenant: true,
        unit: {
          include: {
            property: true,
          },
        },
        room: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedTenants: Tenant[] = leases.map((lease) => {
      // Ligtas na pag-convert ng Decimal papuntang Number
      const leaseRent = lease.monthlyRent ? Number(lease.monthlyRent) : 0;
      const unitRent = lease.unit?.monthlyRent ? Number(lease.unit.monthlyRent) : 0;
      const roomRent = lease.room?.monthlyRent ? Number(lease.room.monthlyRent) : 0;

      const rent = leaseRent > 0 ? leaseRent : (unitRent || roomRent || 0);

      return {
        id: lease.tenant.id,
        userId: lease.tenant.userId || "",
        loginCode: lease.tenant.loginCode || "",
        fullName: lease.tenant.fullName,
        email: lease.tenant.email || "",
        phone: lease.tenant.phone || "",
        emergencyContactName: lease.tenant.emergencyContactName || "",
        emergencyContactPhone: lease.tenant.emergencyContactPhone || "",
        createdAt: lease.tenant.createdAt,
        updatedAt: lease.tenant.updatedAt,
        unitName: lease.unit?.name || lease.room?.unit?.name || "",
        roomNumber: lease.room?.roomNumber || undefined,
        monthlyRent: rent,
        advanceMonths: Number(lease.advanceMonths || 0),
        advanceAmount: Number(lease.advanceAmount || 0),
        depositMonths: Number(lease.depositMonths || 0),
        depositAmount: Number(lease.depositAmount || 0),

        // 👈 Idinagdag ang mga ito para pumasa sa Tenant interface at Modal
        movedInDate: lease.startDate || null,
        startDate: lease.startDate || null,
        dueDate: (lease as any).dueDate || (lease.startDate ? new Date(lease.startDate).getDate() : null),
        dueDay: (lease as any).dueDay || (lease.startDate ? new Date(lease.startDate).getDate() : null),

        leaseStatus: lease.status,
        paymentStatus: lease.paymentStatus,
      };
    });

    return formattedTenants;
  } catch (error) {
    console.error('Error fetching tenants data:', error);
    return [];
  }
}

export async function getUnitsAndRoomsForTenant() {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("session_user_id")?.value;

    if (!adminId) {
      return { unitsData: [], amenities: [] };
    }

    // 1. Kunin ang mga property ID ng landlord
    const landlordProperties = await prisma.property.findMany({
      where: { landlordId: adminId },
      select: { id: true },
    });
    const propertyIds = landlordProperties.map((p) => p.id);

    if (propertyIds.length === 0) {
      return { unitsData: [], amenities: [] };
    }

    // 2. Kunin ang mga unit at vacant rooms sa ilalim ng kanyang mga property
    const units = await prisma.unit.findMany({
      where: { propertyId: { in: propertyIds } },
      include: {
        rooms: {
          where: { status: 'vacant' },
          select: { id: true, roomNumber: true, monthlyRent: true, status: true }
        }
      }
    });

    const serializedUnits = units.map((unit) => ({
      ...unit,
      monthlyRent: unit.monthlyRent ? Number(unit.monthlyRent) : 0,
      rooms: unit.rooms.map((room) => ({
        ...room,
        monthlyRent: room.monthlyRent ? Number(room.monthlyRent) : 0,
      })),
    }));

    // 3. Kunin ang mga active amenities
    const amenities = await prisma.amenity.findMany({
      where: { isActive: true },
    });

    const serializedAmenities = amenities.map((item) => ({
      ...item,
      amount: item.amount ? Number(item.amount) : 0,
    }));

    return { unitsData: serializedUnits, amenities: serializedAmenities };
  } catch (error) {
    console.error('Error fetching units and amenities:', error);
    return { unitsData: [], amenities: [] };
  }
}

export async function addTenantAction(formData: {
  fullName: string;
  email?: string;
  phoneNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  unitId?: string;
  roomId?: string;
  startDate: string;
  endDate?: string;
  advanceMonths?: number;
  depositMonths?: number;
  paymentStatus?: 'paid' | 'pending';
  amenities?: { amenityId: string; amount: number; quantity?: number }[];
}): Promise<{ success: boolean; newTenant?: Tenant; error?: string }> {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("session_user_id")?.value;

    if (!adminId) {
      return { success: false, error: "Walang active session." };
    }

    let monthlyRent = 0;

    // 1. Seguridad at pagkuha ng renta base sa kung Unit o Room ang pinili
    if (formData.unitId) {
      const unitCheck = await prisma.unit.findFirst({
        where: {
          id: formData.unitId,
          property: {
            landlordId: adminId,
          },
        },
        select: { id: true, monthlyRent: true },
      });

      if (!unitCheck) {
        return { success: false, error: "Hindi pinahihintulutan ang pagdagdag ng tenant sa unit na ito." };
      }
      monthlyRent = Number(unitCheck.monthlyRent || 0);
    } else if (formData.roomId) {
      const roomCheck = await prisma.room.findFirst({
        where: {
          id: formData.roomId,
          unit: {
            property: {
              landlordId: adminId,
            },
          },
        },
        select: { id: true, monthlyRent: true },
      });

      if (!roomCheck) {
        return { success: false, error: "Hindi pinahihintulutan ang pagdagdag ng tenant sa silid na ito." };
      }
      monthlyRent = Number(roomCheck.monthlyRent || 0);
    } else {
      return { success: false, error: "Kinakailangang pumili ng Unit o Room." };
    }

    await createAuditLog({
      actorId: adminId,
      action: `Nagdagdag ng bagong tenant kasama ang amenities: ${formData.fullName}`,
      entityType: 'Tenant',
      entityId: adminId,
      metadata: { actionType: 'ADD' },
    });

    const randomString = crypto.randomBytes(3).toString('hex').toUpperCase();
    const loginCode = `TNT-${randomString}`;

    const advMonths = formData.advanceMonths ?? 1;
    const depMonths = formData.depositMonths ?? 1;

    const calculatedAdvanceAmount = monthlyRent * advMonths;
    const calculatedDepositAmount = monthlyRent * depMonths;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(formData.startDate);
    start.setHours(0, 0, 0, 0);

    const leaseStatus = start > today ? 'pending' : 'active';

    // Pagtukoy sa status na tumutugma sa RoomStatus/UnitStatus enum (lahat lowercase)
    const targetStatus = leaseStatus === 'active' ? 'occupied' : 'reserved';

    const initialPaymentStatus = formData.paymentStatus ?? 'pending';

    // I-create ang Tenant kasama ang Emergency Contact details
    const newTenant = await prisma.tenant.create({
      data: {
        userId: adminId,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phoneNumber,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        loginCode: loginCode,
      },
    });

    // I-create ang Lease
    const newLease = await prisma.lease.create({
      data: {
        tenantId: newTenant.id,
        unitId: formData.unitId || null,
        roomId: formData.roomId || null,
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        status: leaseStatus,
        monthlyRent: monthlyRent,
        advanceMonths: advMonths,
        advanceAmount: calculatedAdvanceAmount,
        depositMonths: depMonths,
        depositAmount: calculatedDepositAmount,
        paymentStatus: initialPaymentStatus,
      },
    });

    if (formData.amenities && formData.amenities.length > 0) {
      await prisma.leaseAmenity.createMany({
        data: formData.amenities.map((item) => ({
          leaseId: newLease.id,
          amenityId: item.amenityId,
          amount: item.amount,
          quantity: item.quantity ?? 1,
        })),
      });
    }

    // 2. Pag-update ng Status sa Unit o Room gamit ang tamang lowercase enum value
    if (formData.roomId) {
      // Update muna ang mismong room/bed na pinili
      await prisma.room.update({
        where: { id: formData.roomId },
        data: { status: targetStatus },
      });

      // Suriin kung ang LAHAT ng rooms/beds sa unit na ito ay occupied o reserved na
      const roomCheckDetails = await prisma.room.findUnique({
        where: { id: formData.roomId },
        select: { unitId: true }
      });

      if (roomCheckDetails?.unitId) {
        const parentUnitId = roomCheckDetails.unitId;

        const allRoomsInUnit = await prisma.room.findMany({
          where: { unitId: parentUnitId },
          select: { id: true, status: true }
        });

        // Alamin kung ang bawat kwarto/kama sa unit ay puno na
        const areAllRoomsOccupied = allRoomsInUnit.every(
          (r) => r.status === 'occupied' || r.status === 'reserved'
        );

        // Kung napuno na ang lahat ng beds, i-update din ang status ng buong unit
        if (areAllRoomsOccupied) {
          await prisma.unit.update({
            where: { id: parentUnitId },
            data: { status: targetStatus },
          });
        }
      }

    } else if (formData.unitId) {
      await prisma.unit.update({
        where: { id: formData.unitId },
        data: { status: targetStatus },
      });

      await prisma.room.updateMany({
        where: { unitId: formData.unitId },
        data: { status: targetStatus },
      });
    }

    const newlyCreatedLease = await prisma.lease.findFirst({
      where: { tenantId: newTenant.id },
      include: {
        tenant: true,
        unit: {
          include: { property: true }
        },
        room: {
          include: {
            unit: {
              include: { property: true }
            }
          }
        }
      }
    });

    const formattedNewTenant: Tenant | null = newlyCreatedLease ? {
      id: newlyCreatedLease.tenant.id,
      userId: newlyCreatedLease.tenant.userId || "",
      loginCode: newlyCreatedLease.tenant.loginCode || "",
      fullName: newlyCreatedLease.tenant.fullName,
      email: newlyCreatedLease.tenant.email || "",
      phone: newlyCreatedLease.tenant.phone || "",
      emergencyContactName: newlyCreatedLease.tenant.emergencyContactName || "",
      emergencyContactPhone: newlyCreatedLease.tenant.emergencyContactPhone || "",
      createdAt: newlyCreatedLease.tenant.createdAt,
      updatedAt: newlyCreatedLease.tenant.updatedAt,
      unitName: newlyCreatedLease.unit?.name || newlyCreatedLease.room?.unit?.name || "",
      roomNumber: newlyCreatedLease.room?.roomNumber || undefined,
      monthlyRent: newlyCreatedLease.monthlyRent ? Number(newlyCreatedLease.monthlyRent) : 0,
      advanceMonths: newlyCreatedLease.advanceMonths ? Number(newlyCreatedLease.advanceMonths) : 0,
      advanceAmount: newlyCreatedLease.advanceAmount ? Number(newlyCreatedLease.advanceAmount) : 0,
      depositMonths: newlyCreatedLease.depositMonths ? Number(newlyCreatedLease.depositMonths) : 0,
      depositAmount: newlyCreatedLease.depositAmount ? Number(newlyCreatedLease.depositAmount) : 0,
      leaseStatus: newlyCreatedLease.status,
      paymentStatus: newlyCreatedLease.paymentStatus,
    } : null;

    revalidatePath('/admin/tenants');

    return {
      success: true,
      newTenant: formattedNewTenant ?? undefined
    };
  } catch (error) {
    console.error('Error adding tenant:', error);
    return { success: false, error: 'May naganap na error sa pagdagdag ng tenant.' };
  }
}

export async function updateLeaseStatusAction(
  tenantId: string,
  newStatus: "active" | "pending" | "moving_out" | "inactive"
) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("session_user_id")?.value;

    if (!adminId) {
      return { success: false, error: "Walang active session." };
    }

    const lease = await prisma.lease.findFirst({
      where: {
        tenantId,
        OR: [
          { unit: { property: { landlordId: adminId } } },
          { room: { unit: { property: { landlordId: adminId } } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!lease) {
      return { success: false, error: "Hindi nahanap ang lease o wala kang pahintulot sa tenant na ito." };
    }

    await createAuditLog({
      actorId: adminId,
      action: `Nag-update ng lease status para sa tenant ID: ${tenantId} sa status: ${newStatus}`,
      entityType: 'Tenant',
      entityId: adminId,
      metadata: { actionType: 'UPDATE' },
    });

    await prisma.lease.update({
      where: { id: lease.id },
      data: { status: newStatus },
    });

    if (lease.roomId) {
      if (newStatus === "moving_out" || newStatus === "inactive") {
        await prisma.room.update({
          where: { id: lease.roomId },
          data: { status: "vacant" },
        });
      } else if (newStatus === "active") {
        await prisma.room.update({
          where: { id: lease.roomId },
          data: { status: "occupied" },
        });
      } else if (newStatus === "pending") {
        await prisma.room.update({
          where: { id: lease.roomId },
          data: { status: "reserved" },
        });
      }
    }

    revalidatePath('/admin/tenants');
    return { success: true, message: "Matagumpay na na-update ang status!" };
  } catch (error) {
    console.error('Error updating lease status:', error);
    return { success: false, error: "Nagkaroon ng problema sa pag-update ng status." };
  }
}

export async function getUnitsAndRoomsForTenantByTenantId(tenantId?: string) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("session_user_id")?.value;

    if (!adminId) {
      return { unitsData: [], amenities: [], currentTenantAmenities: [] };
    }

    const landlordProperties = await prisma.property.findMany({
      where: { landlordId: adminId },
      select: { id: true },
    });
    const propertyIds = landlordProperties.map((p) => p.id);

    if (propertyIds.length === 0) {
      return { unitsData: [], amenities: [], currentTenantAmenities: [] };
    }

    // Kunin ang units kasama ang rooms at ang active leases nila
    const units = await prisma.unit.findMany({
      where: { propertyId: { in: propertyIds } },
      include: {
        leases: {
          where: { status: 'active' },
          select: { id: true, roomId: true, tenantId: true }
        },
        rooms: {
          select: { id: true, roomNumber: true, monthlyRent: true, status: true }
        }
      }
    });

    const serializedUnits = units.map((unit) => {
      // 1. May active lease ba sa buong unit? (walang roomId)
      const hasWholeUnitLease = unit.leases.some((l) => !l.roomId);

      // 2. Mayroon bang active lease o occupied status sa kahit anong room/bed sa loob?
      const hasOccupiedRooms = unit.rooms.some((room) => {
        const hasRoomLease = unit.leases.some((l) => l.roomId === room.id);
        return hasRoomLease || room.status === 'occupied' || room.status === 'reserved';
      });

      // 👉 KONDISYON SA BUONG UNIT:
      // Hindi na dapat ma-select ang buong unit kung:
      // - May naka-lease na sa buong unit, O kaya
      // - Mayroon nang naka-occupy na kahit isang bed/room sa loob nito.
      const isWholeUnitDisabled = hasWholeUnitLease || hasOccupiedRooms;

      return {
        ...unit,
        isWholeUnitDisabled,
        monthlyRent: unit.monthlyRent ? Number(unit.monthlyRent) : 0,
        rooms: unit.rooms.map((room) => {
          // 👉 KONDISYON SA BAWAT BED/ROOM:
          const hasRoomLease = unit.leases.some((l) => l.roomId === room.id);
          const isRoomDisabled = hasRoomLease || room.status === 'occupied' || room.status === 'reserved';

          return {
            ...room,
            isRoomDisabled,
            monthlyRent: room.monthlyRent ? Number(room.monthlyRent) : 0,
          };
        }),
      };
    });

    const amenities = await prisma.amenity.findMany({
      where: { isActive: true },
    });

    const serializedAmenities = amenities.map((item) => ({
      ...item,
      amount: item.amount ? Number(item.amount) : 0,
    }));

    let currentTenantAmenities: string[] = [];
    if (tenantId) {
      const activeLease = await prisma.lease.findFirst({
        where: { tenantId, status: 'active' },
        include: { amenities: true },
      });
      if (activeLease) {
        currentTenantAmenities = activeLease.amenities.map((la) => la.amenityId);
      }
    }

    return {
      unitsData: serializedUnits,
      amenities: serializedAmenities,
      currentTenantAmenities
    };
  } catch (error) {
    console.error('Error fetching units and rooms:', error);
    return { unitsData: [], amenities: [], currentTenantAmenities: [] };
  }
}

export async function updateTenantAction(formData: {
  tenantId: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  paymentStatus?: 'paid' | 'pending';
  amenities?: { amenityId: string; amount: number; quantity?: number }[];
}): Promise<{ success: boolean; updatedTenant?: Tenant; error?: string }> {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("session_user_id")?.value;

    if (!adminId) {
      return { success: false, error: "Walang active session." };
    }

    const tenantCheck = await prisma.tenant.findFirst({
      where: {
        id: formData.tenantId,
        leases: {
          some: {
            OR: [
              { unit: { property: { landlordId: adminId } } },
              { room: { unit: { property: { landlordId: adminId } } } }
            ]
          }
        }
      },
      include: {
        leases: {
          where: { status: 'active' },
          take: 1
        }
      }
    });

    if (!tenantCheck) {
      return { success: false, error: "Hindi nahanap ang tenant o wala kang pahintulot." };
    }

    await createAuditLog({
      actorId: adminId,
      action: `Nag-update ng impormasyon ng tenant: ${formData.fullName}`,
      entityType: 'Tenant',
      entityId: formData.tenantId,
      metadata: { actionType: 'UPDATE' },
    });

    // 1. I-update ang Tenant kasama ang Emergency Contact details
    await prisma.tenant.update({
      where: { id: formData.tenantId },
      data: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phoneNumber,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
      }
    });

    const activeLease = tenantCheck.leases[0];
    if (activeLease) {
      // 2. I-update ang paymentStatus ng lease kung ibinigay sa formData
      if (formData.paymentStatus) {
        await prisma.lease.update({
          where: { id: activeLease.id },
          data: { paymentStatus: formData.paymentStatus },
        });
      }

      // 3. I-update ang mga amenities kung kasama sa payload
      if (formData.amenities) {
        await prisma.leaseAmenity.deleteMany({
          where: { leaseId: activeLease.id }
        });

        if (formData.amenities.length > 0) {
          await prisma.leaseAmenity.createMany({
            data: formData.amenities.map((item) => ({
              leaseId: activeLease.id,
              amenityId: item.amenityId,
              amount: item.amount,
              quantity: item.quantity ?? 1,
            })),
          });
        }
      }
    }

    const updatedLeaseData = await prisma.lease.findFirst({
      where: { tenantId: formData.tenantId },
      include: {
        tenant: true,
        unit: { include: { property: true } },
        room: { include: { unit: { include: { property: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedUpdatedTenant: Tenant | null = updatedLeaseData ? {
      id: updatedLeaseData.tenant.id,
      userId: updatedLeaseData.tenant.userId || "",
      loginCode: updatedLeaseData.tenant.loginCode || "",
      fullName: updatedLeaseData.tenant.fullName,
      email: updatedLeaseData.tenant.email || "",
      phone: updatedLeaseData.tenant.phone || "",
      emergencyContactName: updatedLeaseData.tenant.emergencyContactName || "",
      emergencyContactPhone: updatedLeaseData.tenant.emergencyContactPhone || "",
      createdAt: updatedLeaseData.tenant.createdAt,
      updatedAt: updatedLeaseData.tenant.updatedAt,
      unitName: updatedLeaseData.unit?.name || updatedLeaseData.room?.unit?.name || "",
      roomNumber: updatedLeaseData.room?.roomNumber || undefined,
      monthlyRent: updatedLeaseData.monthlyRent ? Number(updatedLeaseData.monthlyRent) : 0,
      advanceMonths: updatedLeaseData.advanceMonths ? Number(updatedLeaseData.advanceMonths) : 0,
      advanceAmount: updatedLeaseData.advanceAmount ? Number(updatedLeaseData.advanceAmount) : 0,
      depositMonths: updatedLeaseData.depositMonths ? Number(updatedLeaseData.depositMonths) : 0,
      depositAmount: updatedLeaseData.depositAmount ? Number(updatedLeaseData.depositAmount) : 0,
      leaseStatus: updatedLeaseData.status,
      paymentStatus: updatedLeaseData.paymentStatus, // 👈 Ginamit na ang tunay na payment status mula sa lease
    } : null;

    revalidatePath('/admin/tenants');

    return {
      success: true,
      updatedTenant: formattedUpdatedTenant ?? undefined
    };
  } catch (error) {
    console.error('Error updating tenant:', error);
    return { success: false, error: 'May naganap na error sa pag-update ng tenant.' };
  }
}