"use client";

import { MapPin, CheckCircle2, ArrowLeft } from "lucide-react";
import { Property } from "@/src/types/property";
import Link from "next/link";

interface PropertyHeaderProps {
    property: Property;
}

export function PropertyHeader({ property }: PropertyHeaderProps) {
    return (
        <div className="mb-8">
            {/* Back Button */}
            <Link
                href="/hanap-bahay"
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-[#E4DDC9] px-4 py-2 font-display text-xs font-bold text-[#153730] hover:bg-[#FAF7EF] transition-all mb-6 shadow-sm"
            >
                <ArrowLeft className="h-4 w-4" />
                <span>Bumalik sa mga Listahan</span>
            </Link>

            {/* Title & Location Info */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="rounded-full bg-[#153730] px-3 py-1 font-display text-xs font-bold text-white shadow-sm">
                            {property.status}
                        </span>
                        {property.verifiedLandlord && (
                            <span className="flex items-center gap-1 rounded-full bg-[#F0A93A] px-2.5 py-1 font-display text-xs font-bold text-[#153730] shadow-sm">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Verified Landlord
                            </span>
                        )}
                    </div>
                    <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#153730] mb-2">
                        {property.title}
                    </h1>
                    <div className="flex items-center gap-1 text-sm font-medium text-[#6B7B74]">
                        <MapPin className="h-4 w-4 text-[#D98F1E]" />
                        <span>{property.location}, {property.city}</span>
                    </div>
                </div>

                <div className="text-left md:text-right">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6B7B74] block">Saklaw ng Renta</span>
                    <div className="font-display text-2xl sm:text-3xl font-black text-[#153730]">
                        {typeof property.price === 'number'
                            ? `₱${property.price.toLocaleString()} `
                            : property.price}
                        {typeof property.price === 'number' && <span className="text-sm font-normal text-[#6B7B74]">/ buwan</span>}
                    </div>
                </div>
            </div>

            {/* Cover Image Banner */}
            <div className="relative h-72 sm:h-96 w-full overflow-hidden rounded-3xl border border-[#E4DDC9] bg-[#1F4B3F]/10 shadow-sm">
                <img
                    src={property.coverImage}
                    alt={property.title}
                    className="h-full w-full object-cover"
                />
            </div>
        </div>
    );
}