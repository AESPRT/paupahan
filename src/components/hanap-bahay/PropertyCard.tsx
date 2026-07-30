"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Bookmark, CheckCircle2, Bed, MapPin, ArrowRight } from "lucide-react";
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
            className="group relative flex flex-col overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--paper-card)] shadow-[0_15px_35px_rgba(21,55,48,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(21,55,48,0.16)]"
        >
            {/* Image Container with Cinematic Aspect Ratio */}
            <div className="relative h-72 w-full overflow-hidden bg-[var(--forest-deep)]/10">
                <Image
                    src={property.coverImage}
                    alt={property.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Subtle top/bottom gradients for absolute readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                {/* Top Status & Verified Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="rounded-full bg-[var(--forest-deep)]/90 backdrop-blur-md px-3.5 py-1.5 font-display text-xs font-bold text-white shadow-lg tracking-wide uppercase">
                        {property.status}
                    </span>
                    {property.verifiedLandlord && (
                        <span className="flex items-center gap-1.5 rounded-full bg-[var(--marigold)] backdrop-blur-md px-3 py-1.5 font-display text-xs font-bold text-[var(--forest-deep)] shadow-lg">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Verified
                        </span>
                    )}
                </div>

                {/* Floating Interactive Buttons */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
                        className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/95 backdrop-blur-md transition-all duration-300 hover:scale-110 shadow-lg ${
                            isFavorite ? "text-[var(--coral)] bg-white" : "text-[var(--ink)]"
                        }`}
                        aria-label="Paborito"
                    >
                        <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsBookmarked(!isBookmarked); }}
                        className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/95 backdrop-blur-md transition-all duration-300 hover:scale-110 shadow-lg ${
                            isBookmarked ? "text-[var(--marigold-deep)] bg-white" : "text-[var(--ink)]"
                        }`}
                        aria-label="I-bookmark"
                    >
                        <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                    </button>
                </div>

                {/* Floating Bottom Metadata inside Image */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-1.5 text-xs font-medium bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        <MapPin className="h-3.5 w-3.5 text-[var(--marigold)]" />
                        <span className="truncate max-w-[200px]">{property.location}, {property.city}</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-1 flex-col p-6">
                <div className="mb-2">
                    <h3 className="font-display text-xl font-extrabold text-[var(--ink)] group-hover:text-[var(--marigold-deep)] transition-colors line-clamp-1">
                        {property.title}
                    </h3>
                </div>

                <p className="font-body text-sm text-[var(--muted)] line-clamp-2 mb-5 font-normal leading-relaxed">
                    {property.description}
                </p>

                {/* Amenities Chips */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {property.amenities.slice(0, 3).map((amenity, idx) => (
                        <span key={idx} className="rounded-xl bg-[var(--paper)] border border-[var(--line)] px-3 py-1 text-xs font-bold text-[var(--ink)]">
                            {amenity}
                        </span>
                    ))}
                    {property.amenities.length > 3 && (
                        <span className="rounded-xl bg-[var(--paper)] border border-[var(--line)] px-2.5 py-1 text-xs font-bold text-[var(--muted)]">
                            +{property.amenities.length - 3} pa
                        </span>
                    )}
                </div>

                {/* Price and CTA Hierarchy */}
                <div className="mt-auto flex items-center justify-between border-t border-[var(--line)] pt-5">
                    <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--muted)] block mb-0.5">Renta Kada Buwan</span>
                        <div className="font-display text-xl sm:text-2xl font-black text-[var(--ink)]">
                            {typeof property.price === 'number'
                                ? `₱${property.price.toLocaleString()}`
                                : property.price}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden xs:flex items-center gap-1 text-xs font-bold text-[var(--ink)] bg-[var(--forest-deep)]/5 px-3 py-2 rounded-xl">
                            <Bed className="h-3.5 w-3.5 text-[var(--marigold-deep)]" />
                            <span>{property.availableUnits} unit</span>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--forest-deep)] text-white transition-transform duration-300 group-hover:scale-105 group-hover:bg-[var(--marigold-deep)]">
                            <ArrowRight className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}