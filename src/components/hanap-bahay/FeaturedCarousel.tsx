"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { PropertyCard } from "./PropertyCard";
import { Property } from "@/src/types/property";

interface FeaturedCarouselProps {
    properties: Property[];
    onViewDetails: (property: Property) => void;
}

export function FeaturedCarousel({ properties, onViewDetails }: FeaturedCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Function para i-center ang active card gamit ang exact offset width
    const scrollToCard = useCallback((index: number) => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const cards = container.querySelectorAll(".carousel-card");
            const targetCard = cards[index] as HTMLElement;

            if (targetCard) {
                const containerWidth = container.offsetWidth;
                const cardWidth = targetCard.offsetWidth;
                // Compute ang tamang scroll left para sa gitna
                const scrollLeft = targetCard.offsetLeft - (containerWidth / 2) + (cardWidth / 2);

                container.scrollTo({
                    left: scrollLeft,
                    behavior: "smooth",
                });
                setActiveIndex(index);
            }
        }
    }, []);

    // Auto-play feature with pause on hover
    useEffect(() => {
        if (properties.length <= 1 || isHovered) return;

        const interval = setInterval(() => {
            const nextIndex = (activeIndex + 1) % properties.length;
            scrollToCard(nextIndex);
        }, 5000);

        return () => clearInterval(interval);
    }, [activeIndex, properties.length, isHovered, scrollToCard]);

    // IntersectionObserver para ma-track kung alin ang nasa gitna habang nagpapatakbo o nag-i-scroll ng mano-mano
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const cards = container.querySelectorAll(".carousel-card");
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute("data-index"));
                        if (!isNaN(index)) {
                            setActiveIndex(index);
                        }
                    }
                });
            },
            {
                root: container,
                threshold: 0.6,
            }
        );

        cards.forEach((card) => observer.observe(card));
        return () => observer.disconnect();
    }, [properties]);

    const handleManualScroll = (direction: "left" | "right") => {
        const newIndex = direction === "left" 
            ? Math.max(0, activeIndex - 1) 
            : Math.min(properties.length - 1, activeIndex + 1);
        scrollToCard(newIndex);
    };

    return (
        <section 
            className="relative z-10 py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-[var(--paper)] via-[var(--carousel-bg-mid,)] to-[var(--paper)]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Ambient background lighting */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full bg-[var(--marigold-deep)]/5 blur-[140px] pointer-events-none" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header & Premium Controls */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--forest-deep)] text-[var(--accent-gold)] text-[11px] font-extrabold uppercase tracking-[0.25em] shadow-sm mb-3.5">
                            Mga Eksklusibong Alok
                        </div>
                        <h2 className="font-display text-3xl sm:text-5xl font-black text-[var(--ink)] tracking-tight">
                            Tampok na Paupahan
                        </h2>
                        <p className="font-body mt-3 text-base sm:text-lg text-[var(--muted)] max-w-xl font-normal leading-relaxed">
                            Pili at mataas ang kalidad na mga tirahan mula sa aming mga pinagkakatiwalaang at beripikadong kasosyong may-ari.
                        </p>
                    </div>

                    {properties.length > 0 && (
                        <div className="flex items-center gap-3 self-end sm:self-auto">
                            <button
                                onClick={() => handleManualScroll("left")}
                                disabled={activeIndex === 0}
                                className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--paper-card)] text-[var(--forest-deep)] shadow-md hover:bg-[var(--forest-deep)] hover:text-white hover:border-[var(--forest-deep)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95"
                                aria-label="Previous Slide"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => handleManualScroll("right")}
                                disabled={activeIndex === properties.length - 1}
                                className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--paper-card)] text-[var(--forest-deep)] shadow-md hover:bg-[var(--forest-deep)] hover:text-white hover:border-[var(--forest-deep)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95"
                                aria-label="Next Slide"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>

                {properties.length === 0 ? (
                    <EmptyState
                        title="Walang Kasalukuyang Tampok na Paupahan"
                        description="Kasalukuyan kaming nagbe-verify ng mga bagong property. Bisitahin muli mamaya!"
                        actionLabel="I-refresh ang Listahan"
                        onReset={() => window.location.reload()}
                    />
                ) : (
                    <>
                        {/* Cover Flow Container na may tamang padding para lumitaw sa gitna ang mga cards */}
                        <div
                            ref={scrollRef}
                            className="flex gap-6 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth py-12 px-[max(1rem,calc(50vw-190px))] sm:px-[max(2rem,calc(50vw-190px))] snap-x snap-mandatory items-center perspective-[1200px]"
                        >
                            {properties.map((property, index) => {
                                const isCenter = index === activeIndex;
                                return (
                                    <div
                                        key={property.id}
                                        data-index={index}
                                        onClick={() => scrollToCard(index)}
                                        className={`carousel-card snap-center w-[300px] sm:w-[380px] flex-shrink-0 cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
                                            isCenter 
                                                ? "scale-[1.04] sm:scale-[1.08] opacity-100 z-20 brightness-100 rotate-0" 
                                                : "scale-90 opacity-50 hover:opacity-80 brightness-90 hover:brightness-95 z-10"
                                        }`}
                                    >
                                        <PropertyCard property={property} onViewDetails={onViewDetails} />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Explicit & Visible Modern Pill & Dot Indicators */}
                        {properties.length > 1 && (
                            <div className="flex items-center justify-center gap-2.5 mt-8 relative z-30">
                                {properties.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => scrollToCard(index)}
                                        className={`h-2.5 rounded-full transition-all duration-500 ease-out cursor-pointer ${
                                            activeIndex === index 
                                                ? "w-10 bg-[var(--forest-deep)] shadow-sm shadow-[var(--forest-deep)]/25" 
                                                : "w-2.5 bg-[var(--line)] hover:bg-[var(--forest-deep)]/40"
                                        }`}
                                        aria-label={`Pumunta sa slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}