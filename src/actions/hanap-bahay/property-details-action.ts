"use server";

import prisma from "@/src/lib/prisma";
import { Property } from "@/src/types/property";

export interface BedDetail {
    id: string;
    bedNumber: string;
    price: number;
    status: string;
}

export interface UnitDetail {
    id: string;
    unitNumber: string;
    type: string;
    price: number;
    floor: string;
    status: string;
    beds: BedDetail[];
}

export interface PropertyDetailsResult {
    property: Property;
    units: UnitDetail[];
}

export async function getPropertyDetailsById(id: string): Promise<PropertyDetailsResult | null> {
    try {
        const prop = await prisma.property.findUnique({
            where: { id },
            include: {
                units: {
                    include: {
                        rooms: true, // Ang Rooms sa DB ang tumatayong beds/bedspaces
                    },
                },
                amenities: true,
                landlord: true,
            },
        });

        if (!prop || !prop.isPublic) {
            return null;
        }

        // 1. Mangolekta ng lahat ng presyo galing sa mga unit o kaya sa mga rooms/beds nila
        const allPrices: number[] = [];
        prop.units.forEach((u) => {
            if (u.monthlyRent) {
                allPrices.push(Number(u.monthlyRent));
            }
            u.rooms.forEach((r) => {
                if (r.monthlyRent) {
                    allPrices.push(Number(r.monthlyRent));
                }
            });
        });

        const minRent = allPrices.length > 0 ? Math.min(...allPrices) : 0;
        const maxRent = allPrices.length > 0 ? Math.max(...allPrices) : 0;

        // 2. Bumuo ng price range display string
        let priceDisplay: number | string = minRent;
        if (allPrices.length > 1 && minRent !== maxRent) {
            priceDisplay = `₱${minRent.toLocaleString()} - ₱${maxRent.toLocaleString()}`;
        } else if (allPrices.length === 1 || minRent === maxRent) {
            priceDisplay = `₱${minRent.toLocaleString()}`;
        }

        const totalVacantUnits = prop.units.filter((u) => u.status === "vacant").length;
        const totalReservedUnits = prop.units.filter((u) => u.status === "reserved").length;

        let propertyStatus: "Vacant" | "Available Soon" | "Just Added" = "Vacant";
        if (totalVacantUnits === 0 && totalReservedUnits > 0) {
            propertyStatus = "Available Soon";
        } else if (totalVacantUnits === 0) {
            propertyStatus = "Available Soon";
        }

        const createdAt = prop.publishedAt || prop.createdAt;
        const diffDays = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
        let addedTime: "today" | "yesterday" | "this_week" = "this_week";
        if (diffDays === 0) addedTime = "today";
        else if (diffDays === 1) addedTime = "yesterday";

        const mappedProperty: Property = {
            id: prop.id,
            title: prop.name,
            location: prop.addressLine,
            city: prop.city,
            price: priceDisplay, // 👈 Nilagay na natin ang range dito
            type: "apartment",
            status: propertyStatus,
            availableUnits: totalVacantUnits,
            verifiedLandlord: prop.landlord?.isActive ?? true,
            coverImage: prop.coverPhotoUrl || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
            roomsCount: prop.units.reduce((acc, u) => acc + u.rooms.length, 0),
            description: prop.addressLine,
            amenities: prop.amenities.map((a) => a.name),
            addedTime: addedTime,
        };

        const mappedUnits: UnitDetail[] = prop.units.map((u) => {
            const standardizedFloor = u.floor && u.floor.trim() !== "" ? u.floor : "1st Floor";
            const standardizedType = u.type && u.type.trim() !== "" ? u.type : "Studio";

            return {
                id: u.id,
                unitNumber: u.name,
                type: standardizedType,
                price: Number(u.monthlyRent || 0),
                floor: standardizedFloor,
                status: u.status,
                beds: u.rooms.map((r) => ({
                    id: r.id,
                    bedNumber: r.roomNumber,
                    price: Number(r.monthlyRent || u.monthlyRent || 0),
                    status: r.status,
                })),
            };
        });

        return {
            property: mappedProperty,
            units: mappedUnits,
        };
    } catch (error) {
        console.error("Error fetching property details:", error);
        return null;
    }
}