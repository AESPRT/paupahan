// ==========================================
// 1. TYPES & INTERFACES (types/property.ts)
// ==========================================
export type PropertyType = "apartment" | "boarding_house" | "solo_room" | "student" | "family";

export interface BedDetail {
    id: string;
    bedNumber: string;
    price: number;
    status: string;
}

export interface RoomDetail {
    id: string;
    roomName: string;
    beds: BedDetail[];
}

export interface UnitDetail {
    id: string;
    unitNumber: string;
    type: string;
    price: number;
    floor: string;
    status: string;
    rooms: RoomDetail[];
}

export interface Property {
    id: string;
    title: string;
    location: string;
    city: string;
    price: number | string;
    type: PropertyType;
    status: "Vacant" | "Available Soon" | "Just Added";
    availableUnits: number;
    verifiedLandlord: boolean;
    coverImage: string;
    roomsCount: number;
    description: string;
    amenities: string[];

    // --- Mga idinagdag para sa Admin & UI Control ---
    isFeatured?: boolean;                  // Para sa FeaturedCarousel component
    createdAt?: string;                    // Sakaling gusto mong gamitin ang saktong petsa mula sa admin form
    addedTime: "today" | "yesterday" | "this_week"; // Para sa NewestListings tabs
}

export interface PropertyDetailsResult {
    property: Property;
    units: UnitDetail[];
}

export interface SearchFiltersState {
    location: string;
    city: string;
    priceRange: [number, number];
    propertyType: string;
    availability: string;
    amenities: string[];
    sort: string;
}