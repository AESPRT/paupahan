// ==========================================
// 6. NEWEST LISTINGS COMPONENT (components/hanap-bahay/NewestListings.tsx)
// ==========================================
"use client";

import { useState } from "react";
import { Property } from "@/src/types/property";
import { PropertyCard } from "./PropertyCard";
import { Clock } from "lucide-react";
import { EmptyState } from "./EmptyState"; // Siguraduhing tama ang import path papunta sa EmptyState mo

interface NewestListingsProps {
    properties: Property[];
    onViewDetails: (property: Property) => void;
}

export function NewestListings({ properties, onViewDetails }: NewestListingsProps) {
    const [tab, setTab] = useState<"today" | "yesterday" | "this_week">("today");

    const filteredProperties = properties.filter((p) => {
        if (tab === "today") return p.addedTime === "today";
        if (tab === "yesterday") return p.addedTime === "yesterday";
        return true;
    });

    // Dynamic text batay sa napiling tab para sa empty state
    const getEmptyStateCopy = () => {
        switch (tab) {
            case "today":
                return {
                    title: "Walang bagong paupahan ngayong araw.",
                    description: "Wala pang nai-post na bagong tahanan ngayong araw. Subukang suriin ang mga nakaraang araw o balikan mamaya.",
                };
            case "yesterday":
                return {
                    title: "Walang bagong paupahan kahapon.",
                    description: "Walang naitalang bagong listahan kahapon. Tingnan ang tab na 'Idinagdag Ngayon' o 'Ng Aldaw na Ito'.",
                };
            case "this_week":
            default:
                return {
                    title: "Walang bagong paupahan ngayong linggo.",
                    description: "Wala kaming makitang bagong tahanan para sa panahong ito. Mangyaring sumilip muli mamaya.",
                };
        }
    };

    const emptyCopy = getEmptyStateCopy();

    return (
        <section className="py-16 bg-[#FFFDF8]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1F4B3F]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1F4B3F] mb-2">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Sariwang Salta</span>
                        </div>
                        <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#153730]">
                            Bagong Idinagdag na Tahanan
                        </h2>
                    </div>

                    {/* Tabs */}
                    <div className="flex rounded-2xl border border-[#E4DDC9] bg-[#FAF7EF] p-1.5">
                        <button
                            onClick={() => setTab("today")}
                            className={`rounded-xl px-4 py-2 font-display text-xs font-bold transition-all ${tab === "today" ? "bg-[#153730] text-white shadow-sm" : "text-[#6B7B74] hover:text-[#153730]"
                                }`}
                        >
                            Idinagdag Ngayon
                        </button>
                        <button
                            onClick={() => setTab("yesterday")}
                            className={`rounded-xl px-4 py-2 font-display text-xs font-bold transition-all ${tab === "yesterday" ? "bg-[#153730] text-white shadow-sm" : "text-[#6B7B74] hover:text-[#153730]"
                                }`}
                        >
                            Kahapon
                        </button>
                        <button
                            onClick={() => setTab("this_week")}
                            className={`rounded-xl px-4 py-2 font-display text-xs font-bold transition-all ${tab === "this_week" ? "bg-[#153730] text-white shadow-sm" : "text-[#6B7B74] hover:text-[#153730]"
                                }`}
                        >
                            Ng Aldaw na Ito
                        </button>
                    </div>
                </div>

                {/* Grid or Reusable Empty State */}
                {filteredProperties.length === 0 ? (
                    <EmptyState
                        title={emptyCopy.title}
                        description={emptyCopy.description}
                        actionLabel="Ipakita ang Ngayon"
                        onReset={() => setTab("today")}
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProperties.map((property) => (
                            <PropertyCard key={property.id} property={property} onViewDetails={onViewDetails} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}