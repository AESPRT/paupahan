// ==========================================
// 5. FEATURED CAROUSEL COMPONENT (components/hanap-bahay/FeaturedCarousel.tsx)
// ==========================================
"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Property } from "@/src/types/property";
import { PropertyCard } from "./PropertyCard";
import { EmptyState } from "./EmptyState"; // Siguraduhing tama ang import path papunta sa EmptyState mo

interface FeaturedCarouselProps {
    properties: Property[];
    onViewDetails: (property: Property) => void;
}

export function FeaturedCarousel({ properties, onViewDetails }: FeaturedCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const offset = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
            scrollRef.current.scrollTo({ left: scrollLeft + offset, behavior: "smooth" });
        }
    };

    return (
        <section className="py-16 bg-[#FAF7EF]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F0A93A]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#D98F1E] mb-2">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Eksklusibo</span>
                        </div>
                        <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#153730]">
                            Mga Tampok na Paupahan
                        </h2>
                    </div>

                    {/* I-render lang ang arrows kung may mga property */}
                    {properties.length > 0 && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => scroll("left")}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E4DDC9] bg-white text-[#153730] hover:bg-[#1F4B3F] hover:text-white transition-all shadow-sm"
                                aria-label="Previous"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => scroll("right")}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E4DDC9] bg-white text-[#153730] hover:bg-[#1F4B3F] hover:text-white transition-all shadow-sm"
                                aria-label="Next"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Carousel Grid or Reusable Empty State */}
                {properties.length === 0 ? (
                    <EmptyState
                        title="Walang Kasalukuyang Tampok na Paupahan"
                        description="Kasalukuyan kaming naghahanap at nagbe-verify ng mga bagong eksklusibong property para sa iyo. Mangyaring bisitahin muli mamaya!"
                        actionLabel="I-refresh ang Listahan"
                        onReset={() => window.location.reload()}
                    />
                ) : (
                    <div
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-1"
                    >
                        {properties.map((property) => (
                            <div key={property.id} className="min-w-[300px] sm:min-w-[360px] max-w-[365px] flex-shrink-0">
                                <PropertyCard property={property} onViewDetails={onViewDetails} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}