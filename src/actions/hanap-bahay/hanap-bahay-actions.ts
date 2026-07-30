"use server";

import prisma from "@/src/lib/prisma";
import { Property } from "@/src/types/property";

interface GetPropertiesParams {
    location?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    propertyType?: string;
    amenity?: string;
    sort?: string;
}

export async function getMarketplaceProperties(params?: GetPropertiesParams): Promise<Property[]> {
    try {
        const propertiesFromDb = await prisma.property.findMany({
            where: {
                isPublic: true,
                ...(params?.city && { city: { equals: params.city, mode: "insensitive" } }),
                ...(params?.location && {
                    OR: [
                        { addressLine: { contains: params.location, mode: "insensitive" } },
                        { city: { contains: params.location, mode: "insensitive" } },
                    ],
                }),
                units: {
                    some: {
                        ...(params?.maxPrice && {
                            monthlyRent: { lte: params.maxPrice },
                        }),
                    },
                },
            },
            include: {
                units: {
                    include: {
                        rooms: true, // Ang Rooms sa DB ang tumatayong beds/bedspaces
                    },
                },
                amenities: true,
                landlord: true,
            },
            orderBy: {
                publishedAt: params?.sort === "price_asc" ? "asc" : "desc",
            },
        });

        const mappedProperties: Property[] = propertiesFromDb.map((prop) => {
            // ✨ 1. Mangolekta ng lahat ng presyo galing sa mga unit at rooms/beds
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

            // ✨ 2. Bumuo ng price range display string
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

            return {
                id: prop.id,
                title: prop.name,
                location: prop.addressLine,
                city: prop.city,
                price: priceDisplay, // 👈 Pwede nang maging string range o eksaktong halaga
                type: "apartment",
                status: propertyStatus,
                availableUnits: totalVacantUnits,
                verifiedLandlord: prop.landlord.isActive,
                coverImage: prop.coverPhotoUrl || "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
                roomsCount: prop.units.reduce((acc, u) => acc + u.rooms.length, 0),
                description: prop.addressLine,
                amenities: prop.amenities.map((a) => a.name),
                addedTime: addedTime,
            };
        });

        return mappedProperties;
    } catch (error) {
        console.error("Error fetching marketplace properties:", error);
        return [];
    }
}