/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import prisma from '@/src/lib/prisma'
import { revalidatePath } from 'next/cache'
import { UtilityType } from '@prisma/client'
import { cookies } from 'next/headers'
import { createAuditLog } from '@/src/actions/audit-actions'

// 1. Kunin ang lahat ng Utility Rates at Amenities mula sa Database
export async function getUtilitiesData() {
  try {
    // Kunin ang mga active utility rates (Kuryente at Tubig na lamang ang default)
    let rates = await prisma.utilityRate.findMany();

    if (rates.length === 0) {
      const defaultRates = [
        { type: UtilityType.electricity, name: 'Kuryente', ratePerUnit: 14, unitLabel: 'kWh' },
        { type: UtilityType.water, name: 'Tubig', ratePerUnit: 35, unitLabel: 'm³' },
      ];

      for (const r of defaultRates) {
        await prisma.utilityRate.create({ data: r });
      }
      rates = await prisma.utilityRate.findMany();
    }

    // Kunin ang mga hiwalay na Amenities mula sa bagong Amenity model
    const amenities = await prisma.amenity.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      rates: rates.map(r => ({
        id: r.id,
        type: r.type,
        name: r.name,
        ratePerUnit: Number(r.ratePerUnit),
        unitLabel: r.unitLabel,
      })),
      amenities: amenities.map(a => ({
        id: a.id,
        name: a.name,
        amount: Number(a.amount),
        frequency: a.frequency,
        description: a.description,
      })),
    };
  } catch (error) {
    console.error('Error fetching utilities data:', error);
    return { rates: [], amenities: [] };
  }
}

// 2. I-update ang Rate per unit ng Utility
export async function updateUtilityRateAction(id: string, newRate: number) {
  try {
    await prisma.utilityRate.update({
      where: { id },
      data: { ratePerUnit: newRate },
    });

    const cookieStore = await cookies();
    const adminId = cookieStore.get("session_user_id")?.value;
    
    if (adminId) {
      await createAuditLog({
        actorId: adminId,
        action: `Binago ang rate ng utility ID: ${id} sa bagong rate: ${newRate}`,
        entityType: 'Utility',
        entityId: adminId,
        metadata: { actionType: 'UPDATE' },
      });
    }

    revalidatePath('/admin/dashboard/utilities');
    return { success: true };
  } catch (error) {
    console.error('Error updating utility rate:', error);
    return { success: false, error: 'Hindi na-update ang rate.' };
  }
}

// 3. ✨ Lumikha ng Bagong Amenity
export async function createAmenityAction(formData: { name: string; amount: number; frequency: string; description?: string }) {
  try {
    // Kunin ang unang property o gumawa nang walang propertyId kung opsyonal
    const property = await prisma.property.findFirst();

    await prisma.amenity.create({
      data: {
        name: formData.name,
        amount: formData.amount,
        frequency: formData.frequency,
        description: formData.description,
        propertyId: property ? property.id : "", // Depende sa iyong schema kung nullable o hindi ang propertyId
      } as any,
    });

    revalidatePath('/admin/dashboard/utilities');
    return { success: true };
  } catch (error) {
    console.error('Error creating amenity:', error);
    return { success: false, error: 'Nabigong idagdag ang amenity.' };
  }
}

// 4. ✨ Mag-delete ng Amenity
export async function deleteAmenityAction(id: string) {
  try {
    await prisma.amenity.delete({
      where: { id },
    });

    revalidatePath('/admin/dashboard/utilities');
    return { success: true };
  } catch (error) {
    console.error('Error deleting amenity:', error);
    return { success: false, error: 'Nabigong tanggalin ang amenity.' };
  }
}