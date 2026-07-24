/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import prisma from '@/src/lib/prisma'
import { revalidatePath } from 'next/cache'
import { UtilityType } from '@prisma/client'
import { cookies } from 'next/headers'
import { createAuditLog } from '@/src/actions/audit-actions'

// 1. Kunin ang lahat ng Utility Rates at Amenities mula sa Database (Isolasiya para sa Landlord)
export async function getUtilitiesData() {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("session_user_id")?.value;

    if (!adminId) {
      return { rates: [], amenities: [] };
    }

    // Kunin ang mga property ID ng naka-login na landlord
    const landlordProperties = await prisma.property.findMany({
      where: { landlordId: adminId },
      select: { id: true },
    });
    const propertyIds = landlordProperties.map((p) => p.id);

    // Kunin ang mga active utility rates (Maaaring i-filter kung may propertyId ang utilityRate, o i-keep global kung sakaling system-wide ang rates)
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

    // Kunin lamang ang mga amenities na naka-attach sa mga property ng landlord na ito (o kung walang propertyId, i-filter kung kinakailangan)
    const amenities = propertyIds.length > 0 ? await prisma.amenity.findMany({
      where: {
        OR: [
          { propertyId: { in: propertyIds } },
          { propertyId: null } as any, // Para sa mga generic amenities kung sakali
        ],
      },
      orderBy: { createdAt: 'desc' },
    }) : [];

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
    const cookieStore = await cookies();
    const adminId = cookieStore.get("session_user_id")?.value;
    
    if (!adminId) {
      return { success: false, error: "Walang active session." };
    }

    await prisma.utilityRate.update({
      where: { id },
      data: { ratePerUnit: newRate },
    });

    await createAuditLog({
      actorId: adminId,
      action: `Binago ang rate ng utility ID: ${id} sa bagong rate: ${newRate}`,
      entityType: 'Utility',
      entityId: adminId,
      metadata: { actionType: 'UPDATE' },
    });

    revalidatePath('/admin/dashboard/utilities');
    return { success: true };
  } catch (error) {
    console.error('Error updating utility rate:', error);
    return { success: false, error: 'Hindi na-update ang rate.' };
  }
}

// 3. ✨ Lumikha ng Bagong Amenity (Nakakonekta sa Property ng Landlord)
export async function createAmenityAction(formData: { name: string; amount: number; frequency: string; description?: string }) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("session_user_id")?.value;

    if (!adminId) {
      return { success: false, error: "Walang active session." };
    }

    // Hanapin ang property na pagmamay-ari ng landlord na ito
    let property = await prisma.property.findFirst({
      where: { landlordId: adminId },
    });

    // Kung wala pang property ang landlord, gawan muna siya ng sariling property
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

    await prisma.amenity.create({
      data: {
        name: formData.name,
        amount: formData.amount,
        frequency: formData.frequency,
        description: formData.description,
        propertyId: property.id, 
      } as any,
    });

    await createAuditLog({
      actorId: adminId,
      action: `Gumawa ng bagong Amenity: ${formData.name}`,
      entityType: 'Amenity',
      entityId: adminId,
      metadata: { actionType: 'ADD' },
    });

    revalidatePath('/admin/dashboard/utilities');
    return { success: true };
  } catch (error) {
    console.error('Error creating amenity:', error);
    return { success: false, error: 'Nabigong idagdag ang amenity.' };
  }
}

// 4. ✨ Mag-delete ng Amenity (May Security Check)
export async function deleteAmenityAction(id: string) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("session_user_id")?.value;

    if (!adminId) {
      return { success: false, error: "Walang active session." };
    }

    // 1. Suriin muna kung ang amenity ay pag-aari ng isang property na pag-aari ng landlord na ito
    const amenityCheck = await prisma.amenity.findFirst({
      where: {
        id,
        property: {
          landlordId: adminId,
        },
      },
    });

    if (!amenityCheck) {
      return { success: false, error: "Hindi natagpuan ang amenity o wala kang pahintulot na burahin ito." };
    }

    await prisma.amenity.delete({
      where: { id },
    });

    await createAuditLog({
      actorId: adminId,
      action: `Nagbura ng Amenity ID: ${id}`,
      entityType: 'Amenity',
      entityId: adminId,
      metadata: { actionType: 'DELETE' },
    });

    revalidatePath('/admin/dashboard/utilities');
    return { success: true };
  } catch (error) {
    console.error('Error deleting amenity:', error);
    return { success: false, error: 'Nabigong tanggalin ang amenity.' };
  }
}