// ==========================================
// 4. PROPERTY CARD COMPONENT (components/hanap-bahay/PropertyCard.tsx)
// ==========================================
"use client";

import { useState } from "react";
import { Heart, Bookmark, CheckCircle2, Bed, MapPin } from "lucide-react";
import { Property } from "@/src/types/property";

interface PropertyCardProps {
    property: Property;
    onViewDetails: (property: Property) => void;
}

export function PropertyCard({ property, onViewDetails }: PropertyCardProps) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    return (
        <div
            onClick={() => onViewDetails(property)}
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-[#E4DDC9] bg-[#FFFDF8] shadow-[0_10px_30px_rgba(21,55,48,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(21,55,48,0.12)] cursor-pointer"
        >
            {/* Image Container */}
            <div className="relative h-64 w-full overflow-hidden bg-[#1F4B3F]/10">
                <img
                    src={property.coverImage}
                    alt={property.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="rounded-full bg-[#153730]/90 backdrop-blur-md px-3 py-1 font-display text-xs font-bold text-white shadow-sm">
                        {property.status}
                    </span>
                    {property.verifiedLandlord && (
                        <span className="flex items-center gap-1 rounded-full bg-[#F0A93A] px-2.5 py-1 font-display text-xs font-bold text-[#153730] shadow-sm">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Verified
                        </span>
                    )}
                </div>

                {/* Favorite & Bookmark Actions */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
                        className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-md transition-all hover:scale-110 shadow-sm ${isFavorite ? "text-red-500" : "text-[#153730]"
                            }`}
                        aria-label="Favorite"
                    >
                        <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsBookmarked(!isBookmarked); }}
                        className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-md transition-all hover:scale-110 shadow-sm ${isBookmarked ? "text-[#D98F1E]" : "text-[#153730]"
                            }`}
                        aria-label="Bookmark"
                    >
                        <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-display text-lg font-extrabold text-[#153730] group-hover:text-[#1F4B3F] transition-colors line-clamp-1">
                        {property.title}
                    </h3>
                </div>

                <div className="flex items-center gap-1 text-xs font-medium text-[#6B7B74] mb-3">
                    <MapPin className="h-3.5 w-3.5 text-[#D98F1E]" />
                    <span>{property.location}, {property.city}</span>
                </div>

                <p className="text-xs text-[#6B7B74] line-clamp-2 mb-4">
                    {property.description}
                </p>

                {/* Amenities row */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {property.amenities.slice(0, 3).map((amenity, idx) => (
                        <span key={idx} className="rounded-lg bg-[#FAF7EF] border border-[#E4DDC9] px-2.5 py-1 text-[11px] font-semibold text-[#153730]">
                            {amenity}
                        </span>
                    ))}
                    {property.amenities.length > 3 && (
                        <span className="rounded-lg bg-[#FAF7EF] border border-[#E4DDC9] px-2 py-1 text-[11px] font-semibold text-[#6B7B74]">
                            +{property.amenities.length - 3} pa
                        </span>
                    )}
                </div>

                {/* Footer Details & Price Range */}
                <div className="mt-auto flex items-center justify-between border-t border-[#E4DDC9] pt-4">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7B74] block">Saklaw ng Renta</span>
                        <div className="font-display text-base font-black text-[#153730]">
                            {typeof property.price === 'number'
                                ? `₱${property.price.toLocaleString()}`
                                : property.price}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-[#1F4B3F] bg-[#1F4B3F]/10 px-3 py-1.5 rounded-xl">
                        <Bed className="h-3.5 w-3.5" />
                        <span>{property.availableUnits} unit bakante</span>
                    </div>
                </div>
            </div>
        </div>
    );
}