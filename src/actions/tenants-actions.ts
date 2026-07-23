'use server'

import prisma from '@/src/lib/prisma'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { Tenant } from '@/src/types/tenant/tenant'

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

    return serializedUnits;
  } catch (error) {
    console.error('Error fetching units/rooms:', error);
    return [];
  }
}

export async function addTenantAction(formData: {
  fullName: string;
  email?: string;
  phoneNumber?: string;
  roomId: string;
  startDate: string;
  endDate?: string;
  advanceMonths?: number; // 👈 Pwedeng ipasa mula sa UI (Halimbawa: 1)
  depositMonths?: number; // 👈 Pwedeng ipasa mula sa UI (Halimbawa: 2)
}): Promise<{ success: boolean; newTenant?: Tenant; error?: string }> {
  try {
    const randomString = crypto.randomBytes(3).toString('hex').toUpperCase();
    const loginCode = `TENANT-${randomString}`;

    // 1. Kunin ang monthly rent mula sa Room
    const room = await prisma.room.findUnique({
      where: { id: formData.roomId },
      select: { monthlyRent: true },
    });

    const roomRent = room ? Number(room.monthlyRent) : 0;

    // 2. Itakda ang bilang ng buwan (Default to 1 advance, 1 deposit kung hindi na-provide)
    const advMonths = formData.advanceMonths ?? 1;
    const depMonths = formData.depositMonths ?? 1;

    const calculatedAdvanceAmount = roomRent * advMonths;
    const calculatedDepositAmount = roomRent * depMonths;

    // 3. Suriin kung ang Start Date ay sa hinaharap (Future Date)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = new Date(formData.startDate);
    start.setHours(0, 0, 0, 0);

    const leaseStatus = start > today ? 'pending' : 'active';

    // 4. I-create ang Tenant record
    const newTenant = await prisma.tenant.create({
      data: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phoneNumber,
        loginCode: loginCode,
      },
    });

    // 5. I-create ang Lease kasama ang computed advance at deposit
    await prisma.lease.create({
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

    // 6. I-update ang status ng Room na maging 'occupied'
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