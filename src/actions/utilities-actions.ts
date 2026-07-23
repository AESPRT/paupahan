'use server'

import prisma from '@/src/lib/prisma'
import { revalidatePath } from 'next/cache'
import { UtilityType, BillStatus } from '@prisma/client'

// 1. Kunin ang lahat ng Utility Rates at Bills mula sa Database
export async function getUtilitiesData() {
  try {
    // Kunin ang mga active rates
    let rates = await prisma.utilityRate.findMany();

    // Kung wala pang rates sa database, i-initialize natin ang default rates gamit ang UtilityType enum
    if (rates.length === 0) {
      const defaultRates = [
        { type: UtilityType.electricity, name: 'Kuryente', ratePerUnit: 14, unitLabel: 'kWh' },
        { type: UtilityType.water, name: 'Tubig', ratePerUnit: 35, unitLabel: 'm³' },
        { type: UtilityType.internet, name: 'WiFi', ratePerUnit: 300, unitLabel: 'Flat / Room' },
        { type: UtilityType.amenities, name: 'Trash / Maint.', ratePerUnit: 150, unitLabel: 'Flat / Month' },
      ];

      for (const r of defaultRates) {
        await prisma.utilityRate.create({ data: r });
      }
      rates = await prisma.utilityRate.findMany();
    }

    // Kunin ang mga utility bills mula sa Bills table kasama ang lease, tenant, room, at unit
    const dbBills = await prisma.bill.findMany({
      include: {
        lease: {
          include: {
            tenant: { select: { fullName: true } },
            room: {
              include: {
                unit: { select: { name: true } }
              }
            }
          }
        }
      },
      orderBy: { generatedAt: 'desc' } // Pinalitan mula sa createdAt patungong generatedAt batay sa schema
    });

    const formattedBills = dbBills.map((bill) => ({
      id: bill.id,
      unitName: bill.lease.room.unit.name,
      roomNumber: bill.lease.room.roomNumber,
      tenantName: bill.lease.tenant.fullName,
      type: (bill.metadata as any)?.utilityType || 'electricity',
      totalAmount: Number(bill.totalAmount),
      dueDate: bill.dueDate.toISOString().split('T')[0],
      status: bill.status === BillStatus.paid ? 'Paid' : (bill.status === BillStatus.overdue ? 'Overdue' : 'Pending'),
    }));

    return {
      rates: rates.map(r => ({
        id: r.id,
        type: r.type,
        name: r.name,
        ratePerUnit: Number(r.ratePerUnit),
        unitLabel: r.unitLabel,
      })),
      bills: formattedBills,
    };
  } catch (error) {
    console.error('Error fetching utilities data:', error);
    return { rates: [], bills: [] };
  }
}

// 2. I-update ang Rate per unit
export async function updateUtilityRateAction(id: string, newRate: number) {
  try {
    await prisma.utilityRate.update({
      where: { id },
      data: { ratePerUnit: newRate },
    });
    revalidatePath('/admin/dashboard/utilities');
    return { success: true };
  } catch (error) {
    console.error('Error updating utility rate:', error);
    return { success: false, error: 'Hindi na-update ang rate.' };
  }
}

// 3. Magdagdag / Mag-assign ng Utility Bill sa isang Room/Tenant
export async function assignUtilityBillAction(data: {
  roomId: string;
  type: string;
  totalAmount: number;
  dueDate: string;
}) {
  try {
    // Hanapin ang active lease ng kwarto para malaman kung sino ang tenant
    const activeLease = await prisma.lease.findFirst({
      where: { roomId: data.roomId, status: 'active' },
    });

    if (!activeLease) {
      return { success: false, error: 'Walang aktibong tenant o lease sa kwartong ito.' };
    }

    const billingMonthYear = new Date(data.dueDate).toISOString().slice(0, 7); // YYYY-MM

    await prisma.bill.create({
      data: {
        leaseId: activeLease.id,
        tenantId: activeLease.tenantId,
        billingMonthYear,
        rentAmount: 0, // Utility bill lang ito
        utilityAmount: data.totalAmount,
        totalAmount: data.totalAmount,
        dueDate: new Date(data.dueDate),
        status: BillStatus.pending,
        metadata: { utilityType: data.type },
      },
    });

    revalidatePath('/admin/dashboard/utilities');
    return { success: true };
  } catch (error) {
    console.error('Error assigning utility bill:', error);
    return { success: false, error: 'May naganap na error sa pag-assign ng bill.' };
  }
}

// 4. Markahan bilang Paid ang Bill
export async function markBillAsPaidAction(billId: string) {
  try {
    await prisma.bill.update({
      where: { id: billId },
      data: { status: BillStatus.paid },
    });

    revalidatePath('/admin/dashboard/utilities');
    return { success: true };
  } catch (error) {
    console.error('Error marking bill as paid:', error);
    return { success: false, error: 'Hindi na-update ang status ng bill.' };
  }
}