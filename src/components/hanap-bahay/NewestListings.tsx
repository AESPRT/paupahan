"use client";

import { useState } from "react";
import { Property } from "@/src/types/property";
import { PropertyCard } from "./PropertyCard";
import { EmptyState } from "./EmptyState";

interface NewestListingsProps {
    properties: Property[];
    onViewDetails: (property: Property) => void;
}

const TABS = [
    { id: "today", label: "Ngayon" },
    { id: "yesterday", label: "Kahapon" },
    { id: "this_week", label: "Ngayong Linggo" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function NewestListings({ properties, onViewDetails }: NewestListingsProps) {
    const [tab, setTab] = useState<TabId>("today");

    const filteredProperties = properties.filter((p) => {
        if (tab === "today") return p.addedTime === "today";
        if (tab === "yesterday") return p.addedTime === "yesterday";
        return true;
    });

    const emptyCopy: Record<TabId, { title: string; description: string }> = {
        today: {
            title: "Walang bagong paupahan ngayong araw",
            description: "Wala pang nai-post ngayong araw. Subukang tingnan ang ibang tab.",
        },
        yesterday: {
            title: "Walang bagong paupahan kahapon",
            description: "Walang naitalang listahan kahapon. Tingnan ang 'Ngayon' o 'Ngayong Linggo'.",
        },
        this_week: {
            title: "Walang bagong paupahan ngayong linggo",
            description: "Wala kaming makitang bagong tahanan sa linggong ito. Balikan mamaya.",
        },
    };

    return (
        <section className="py-16 bg-[#FFFDF8]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#1F4B3F]">
                            Sariwang Salta
                        </span>
                        <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-extrabold text-[#153730]">
                            Bagong Idinagdag na Tahanan
                        </h2>
                    </div>

                    <div className="flex gap-1 border-b border-[#E4DDC9] sm:border-b-0">
                        {TABS.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`relative px-3.5 py-2 text-sm font-bold transition-colors ${
                                    tab === t.id ? "text-[#153730]" : "text-[#8A9A93] hover:text-[#153730]"
                                }`}
                            >
                                {t.label}
                                {tab === t.id && (
                                    <span className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-[#F0A93A]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredProperties.length === 0 ? (
                    <EmptyState
                        title={emptyCopy[tab].title}
                        description={emptyCopy[tab].description}
                        actionLabel="Ipakita ang Ngayon"
                        onReset={() => setTab("today")}
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProperties.map((property) => (
                            <div key={property.id} className="transition-transform hover:-translate-y-1">
                                <PropertyCard property={property} onViewDetails={onViewDetails} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}