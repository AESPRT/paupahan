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

    if (roomIds.length === 0) {
      return []
    }

    // 4. Kunin lang ang mga lease na nakapaloob sa mga room ng landlord na ito
    const leases = await prisma.lease.findMany({
      where: { roomId: { in: roomIds } },
      include: {
        tenant: true,
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
      const rent = Number(lease.monthlyRent) > 0 ? Number(lease.monthlyRent) : Number(lease.room.monthlyRent);

      return {
        id: lease.tenant.id,
        userId: lease.tenant.userId,
        loginCode: lease.tenant.loginCode,
        fullName: lease.tenant.fullName,
        email: lease.tenant.email,
        phone: lease.tenant.phone,
        emergencyContactName: lease.tenant.emergencyContactName,
        emergencyContactPhone: lease.tenant.emergencyContactPhone,
        createdAt: lease.tenant.createdAt,
        updatedAt: lease.tenant.updatedAt,
        unitName: lease.room.unit.name,
        roomNumber: lease.room.roomNumber,
        monthlyRent: rent,
        advanceMonths: Number(lease.advanceMonths),
        advanceAmount: Number(lease.advanceAmount),
        depositMonths: Number(lease.depositMonths),
        depositAmount: Number(lease.depositAmount),
        leaseStatus: lease.status,
        paymentStatus: 'paid', 
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

    // 2. Kunin lamang ang mga unit at vacant rooms sa ilalim ng kanyang mga property
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
      rooms: unit.rooms.map((room) => ({
        ...room,
        monthlyRent: Number(room.monthlyRent),
      })),
    }));

    // 3. Kunin ang mga amenities na pagmamay-ari o naka-set para sa landlord na ito (o generic active amenities)
    const amenities = await prisma.amenity.findMany({
      where: { isActive: true },
    });

    const serializedAmenities = amenities.map((item) => ({
      ...item,
      amount: Number(item.amount),
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
  roomId: string;
  startDate: string;
  endDate?: string;
  advanceMonths?: number;
  depositMonths?: number;
  amenities?: { amenityId: string; amount: number; quantity?: number }[];
}): Promise<{ success: boolean; newTenant?: Tenant; error?: string }> {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("session_user_id")?.value;

    if (!adminId) {
      return { success: false, error: "Walang active session." };
    }

    // 1. Seguridad: Suriin kung ang roomId ay talagang kabilang sa isang property ng landlord na ito
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

    await createAuditLog({
        actorId: adminId,
        action: `Nagdagdag ng bagong tenant kasama ang amenities: ${formData.fullName}`,
        entityType: 'Tenant',
        entityId: adminId,
        metadata: { actionType: 'ADD' },
    })

    const randomString = crypto.randomBytes(3).toString('hex').toUpperCase();
    const loginCode = `TNT-${randomString}`;

    const roomRent = Number(roomCheck.monthlyRent);
    const advMonths = formData.advanceMonths ?? 1;
    const depMonths = formData.depositMonths ?? 1;

    const calculatedAdvanceAmount = roomRent * advMonths;
    const calculatedDepositAmount = roomRent * depMonths;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = new Date(formData.startDate);
    start.setHours(0, 0, 0, 0);

    const leaseStatus = start > today ? 'pending' : 'active';

    const newTenant = await prisma.tenant.create({
      data: {
        userId: adminId,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phoneNumber,
        loginCode: loginCode,
      },
    });

    // I-create ang Lease
    const newLease = await prisma.lease.create({
      data: {
        tenantId: newTenant.id,
        roomId: formData.roomId,
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        status: leaseStatus,
        monthlyRent: roomRent,
        advanceMonths: advMonths,
        advanceAmount: calculatedAdvanceAmount,
        depositMonths: depMonths,
        depositAmount: calculatedDepositAmount,
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

    await prisma.room.update({
      where: { id: formData.roomId },
      data: { status: 'occupied' },
    });

    const newlyCreatedLease = await prisma.lease.findFirst({
      where: { tenantId: newTenant.id },
      include: {
        tenant: true,
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
      userId: newlyCreatedLease.tenant.userId,
      loginCode: newlyCreatedLease.tenant.loginCode,
      fullName: newlyCreatedLease.tenant.fullName,
      email: newlyCreatedLease.tenant.email,
      phone: newlyCreatedLease.tenant.phone,
      emergencyContactName: newlyCreatedLease.tenant.emergencyContactName,
      emergencyContactPhone: newlyCreatedLease.tenant.emergencyContactPhone,
      createdAt: newlyCreatedLease.tenant.createdAt,
      updatedAt: newlyCreatedLease.tenant.updatedAt,
      unitName: newlyCreatedLease.room.unit.name,
      roomNumber: newlyCreatedLease.room.roomNumber,
      monthlyRent: Number(newlyCreatedLease.monthlyRent),
      depositAmount: Number(newlyCreatedLease.depositAmount),
      leaseStatus: newlyCreatedLease.status,
      paymentStatus: 'paid',
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

export async function updateLeaseStatusAction(tenantId: string, newStatus: "active" | "pending" | "moving_out" | "inactive") {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("session_user_id")?.value;

    if (!adminId) {
      return { success: false, error: "Walang active session." };
    }

    // 1. Seguridad: Hanapin ang lease at siguraduhing ang room nito ay pagmamay-ari ng landlord na ito
    const lease = await prisma.lease.findFirst({
      where: { 
        tenantId,
        room: {
          unit: {
            property: {
              landlordId: adminId,
            },
          },
        },
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
    })

    // 2. I-update ang status ng lease
    await prisma.lease.update({
      where: { id: lease.id },
      data: { status: newStatus },
    });

    // 3. Awtomatikong i-update ang room status
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

    revalidatePath('/admin/tenants');
    return { success: true, message: "Matagumpay na na-update ang status!" };
  } catch (error) {
    console.error('Error updating lease status:', error);
    return { success: false, error: "Nagkaroon ng problema sa pag-update ng status." };
  }
}

export async function assignAmenitiesToLease(leaseId: string, amenitiesPayload: { amenityId: string; amount: number; quantity?: number }[]) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("session_user_id")?.value;

    if (!adminId) {
      return { success: false, error: "Walang active session." };
    }

    // 1. Seguridad: Suriin kung ang lease ay pag-aari ng landlord na ito
    const leaseCheck = await prisma.lease.findFirst({
      where: {
        id: leaseId,
        room: {
          unit: {
            property: {
              landlordId: adminId,
            },
          },
        },
      },
      select: { id: true },
    });

    if (!leaseCheck) {
      return { success: false, error: "Wala kang pahintulot na baguhin ang lease na ito." };
    }

    // 2. Burahin muna ang lumang nakatalagang amenities ng lease na ito
    await prisma.leaseAmenity.deleteMany({
      where: { leaseId },
    });

    // 3. I-save ang mga bagong piniling amenities
    if (amenitiesPayload.length > 0) {
      const dataToCreate = amenitiesPayload.map((item) => ({
        leaseId,
        amenityId: item.amenityId,
        amount: item.amount,
        quantity: item.quantity ?? 1,
      }));

      await prisma.leaseAmenity.createMany({
        data: dataToCreate,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error assigning amenities to lease:", error);
    return { success: false, error: "Nabigong i-save ang mga amenities sa lease." };
  }
}