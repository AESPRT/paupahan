'use server'

import prisma from '@/src/lib/prisma'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import { Tenant } from '@/src/types/tenant/tenant'
import { createAuditLog } from '@/src/actions/audit-actions'

export async function getTenantsData(): Promise<Tenant[]> {
  try {
    const leases = await prisma.lease.findMany({
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
    const units = await prisma.unit.findMany({
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

    // 👇 Kunin ang mga aktibong amenities para mapagpilian sa modal
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
  amenities?: { amenityId: string; amount: number; quantity?: number }[]; // 👈 Bagong field para sa amenities
}): Promise<{ success: boolean; newTenant?: Tenant; error?: string }> {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("session_user_id")?.value;

    if (!adminId) {
      return { success: false, error: "Walang active session." };
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

    const room = await prisma.room.findUnique({
      where: { id: formData.roomId },
      select: { monthlyRent: true },
    });

    const roomRent = room ? Number(room.monthlyRent) : 0;
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

    // 👇 I-save ang mga piniling amenities sa LeaseAmenity table kung mayroon man
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

    await createAuditLog({
        actorId: adminId,
        action: `Nag-update ng lease status para sa tenant ID: ${tenantId} sa status: ${newStatus}`,
        entityType: 'Tenant',
        entityId: adminId,
        metadata: { actionType: 'UPDATE' },
    })

    const lease = await prisma.lease.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    if (!lease) {
      return { success: false, error: "Hindi nahanap ang lease para sa tenant na ito." };
    }

    // 1. I-update ang status ng lease
    await prisma.lease.update({
      where: { id: lease.id },
      data: { status: newStatus },
    });

    // 2. Awtomatikong gawing 'vacant' ang room kung ang tenant ay lumilipat na o inactive na
    if (newStatus === "moving_out" || newStatus === "inactive") {
      await prisma.room.update({
        where: { id: lease.roomId },
        data: { status: "vacant" },
      });
    } 
    // Opsyonal: Kung sakaling ibinalik sa 'active', pwedeng ibalik sa occupied ang room
    else if (newStatus === "active") {
      await prisma.room.update({
        where: { id: lease.roomId },
        data: { status: "occupied" },
      });
    }

    else if (newStatus === "pending") {
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
    // 1. Burahin muna ang lumang nakatalagang amenities ng lease na ito para ma-update
    await prisma.leaseAmenity.deleteMany({
      where: { leaseId },
    });

    // 2. I-save ang mga bagong piniling amenities kasama ang snapshot ng amount
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