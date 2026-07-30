"use client";

import { useState } from "react";
import { PropertyHeader } from "@/src/components/hanap-bahay/details/PropertyHeader";
import { AvailableUnitsList } from "@/src/components/hanap-bahay/details/AvailableUnitsList";
import { BookViewingModal } from "@/src/components/hanap-bahay/details/BookViewingModal";
import {
    Sparkles,
    ShieldCheck,
    Wifi,
    Car,
    Tv,
    Coffee,
    Utensils,
    Wind,
    CheckCircle2,
    Calendar,
    Home,
    Heart,
    Share2,
    Lock
} from "lucide-react";
import { Property } from "@/src/types/property";
import { UnitDetail } from "@/src/actions/hanap-bahay/property-details-action";

interface PropertyDetailsClientProps {
    property: Property;
    units: UnitDetail[];
}

const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes("wifi") || lower.includes("internet")) return <Wifi className="h-4 w-4 text-[#153730]" />;
    if (lower.includes("parking") || lower.includes("garage")) return <Car className="h-4 w-4 text-[#153730]" />;
    if (lower.includes("tv") || lower.includes("netflix")) return <Tv className="h-4 w-4 text-[#153730]" />;
    if (lower.includes("coffee") || lower.includes("kape")) return <Coffee className="h-4 w-4 text-[#153730]" />;
    if (lower.includes("kitchen") || lower.includes("lutuan") || lower.includes("luto")) return <Utensils className="h-4 w-4 text-[#153730]" />;
    if (lower.includes("ac") || lower.includes("aircon") || lower.includes("air conditioning")) return <Wind className="h-4 w-4 text-[#153730]" />;
    return <CheckCircle2 className="h-4 w-4 text-[#153730]" />;
};

export function PropertyDetailsClient({ property, units }: PropertyDetailsClientProps) {
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [selectedBookingTarget, setSelectedBookingTarget] = useState<{ title: string; price: number; type: 'unit' | 'bed'; id: string } | null>(null);
    const [isLiked, setIsLiked] = useState(false);

    const handleSelectBookingTarget = (target: { title: string; price: number; type: 'unit' | 'bed'; id: string }) => {
        setSelectedBookingTarget(target);
        setIsBookingOpen(true);
    };

    const vacantUnits = units.filter(u => u.status === "vacant");

    return (
        <main className="min-h-screen bg-[#FAF7EF] pb-24 pt-6 selection:bg-[#153730] selection:text-[#FAF7EF]">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

                {/* Floating Top Bar */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#6B7B74]">
                        <Home className="h-3.5 w-3.5 text-[#153730]" />
                        <span>HanapBahay</span>
                        <span>/</span>
                        <span className="text-[#153730] font-semibold truncate max-w-[200px] sm:max-w-xs">{property.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsLiked(!isLiked)}
                            className="flex items-center gap-1.5 rounded-full bg-[#FFFDF8] border border-[#E4DDC9] px-3.5 py-1.5 text-xs font-semibold text-[#153730] shadow-sm hover:bg-[#F4EFE6] transition-all"
                        >
                            <Heart className={`h-3.5 w-3.5 transition-colors ${isLiked ? "fill-[#D98F1E] text-[#D98F1E]" : "text-[#153730]"}`} />
                            <span className="hidden sm:inline">{isLiked ? "Naka-save" : "I-save"}</span>
                        </button>
                    </div>
                </div>

                <div className="mb-10">
                    <PropertyHeader property={property} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-10">
                        <div className="rounded-3xl border border-[#E4DDC9] bg-[#FFFDF8] p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FAF7EF] border border-[#E4DDC9]">
                                    <Sparkles className="h-5 w-5 text-[#D98F1E]" />
                                </div>
                                <div>
                                    <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#153730]">Tungkol sa Tahanang Ito</h2>
                                    <p className="text-xs text-[#6B7B74]">Idinisenyo para sa komportable at modernong pamumuhay</p>
                                </div>
                            </div>

                            <p className="text-xs sm:text-sm text-[#6B7B74] leading-relaxed whitespace-pre-line mb-8">
                                {property.description}
                            </p>

                            <div className="h-px w-full bg-[#E4DDC9]/60 my-6" />

                            <div>
                                <h3 className="font-display text-sm font-extrabold text-[#153730] mb-4">Mga Kagamitan at Pasilidad (Amenities)</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {property.amenities.map((amenity, idx) => (
                                        <div key={idx} className="group flex items-center gap-3 rounded-2xl bg-[#FAF7EF] border border-[#E4DDC9] p-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FFFDF8] border border-[#E4DDC9]">
                                                {getAmenityIcon(amenity)}
                                            </div>
                                            <span className="text-xs font-bold text-[#153730] line-clamp-1">{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Available Units & Beds Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <div>
                                    <h3 className="font-display text-lg font-extrabold text-[#153730]">Mga Bakanteng Unit at Bedspace</h3>
                                    <p className="text-xs text-[#6B7B74]">Pumili ng buong unit o partikular na kama (bed space) na nais mong i-book</p>
                                </div>
                            </div>

                            <AvailableUnitsList units={vacantUnits} onSelectUnitToBook={handleSelectBookingTarget} />
                        </div>
                    </div>

                    {/* Right Column / Sticky Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="rounded-3xl border-2 border-[#E4DDC9] bg-[#FFFDF8] p-6 sm:p-8 shadow-xl sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <span className="text-[11px] font-bold tracking-wider uppercase text-[#6B7B74]">Saklaw ng Renta</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-display text-xl sm:text-2xl font-black text-[#153730]">
                                            {typeof property.price === 'number'
                                                ? `₱${property.price.toLocaleString()}`
                                                : property.price}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#153730]/5 text-[#153730]">
                                    <Sparkles className="h-5 w-5 text-[#D98F1E]" />
                                </div>
                            </div>

                            <p className="text-[11px] text-[#6B7B74] mb-6 leading-relaxed">
                                Mangyaring pumili ng partikular na **Unit** o **Bed** sa kaliwang listahan upang mag-book ng viewing.
                            </p>

                            <div className="space-y-3 pt-4 border-t border-[#E4DDC9]/60">
                                <div className="flex items-center gap-2 text-[11px] text-[#6B7B74]">
                                    <ShieldCheck className="h-4 w-4 text-[#1F4B3F] shrink-0" />
                                    <span>100% Beripikadong Listahan at May-ari</span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-[#6B7B74]">
                                    <Lock className="h-4 w-4 text-[#1F4B3F] shrink-0" />
                                    <span>Walang nakatagong bayarin sa pag-book</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal para sa Booking */}
                {isBookingOpen && (
                    <BookViewingModal
                        propertyName={property.title}
                        selectedUnit={selectedBookingTarget ? { unitNumber: selectedBookingTarget.title, price: selectedBookingTarget.price } : null}
                        onClose={() => setIsBookingOpen(false)}
                    />
                )}
            </div>
        </main>
    );
}