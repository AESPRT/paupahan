"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { PropertyCard } from "./PropertyCard";
import { PropertySkeleton } from "./PropertySkeleton";
import { Property } from "@/src/types/property";

interface FeaturedCarouselProps {
  properties: Property[];
  isLoading?: boolean;
  onViewDetails: (property: Property) => void;
}

export function FeaturedCarousel({
  properties,
  isLoading = false,
  onViewDetails,
}: FeaturedCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  // lock flag — prevents observer from overriding a programmatic scroll
  const isProgrammaticScroll = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToCard = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const cards = container.querySelectorAll(".carousel-card");
    const target = cards[index] as HTMLElement;
    if (!target) return;

    // set index immediately + lock observer for 800ms (scroll duration)
    setActiveIndex(index);
    isProgrammaticScroll.current = true;
    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 800);

    const scrollLeft =
      target.offsetLeft - container.offsetWidth / 2 + target.offsetWidth / 2;
    container.scrollTo({ left: scrollLeft, behavior: "smooth" });
  }, []);

  // IntersectionObserver — only fires on manual swipe, not programmatic scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const cards = container.querySelectorAll(".carousel-card");
    const observer = new IntersectionObserver(
      (entries) => {
        // ignore observer callbacks during programmatic scroll
        if (isProgrammaticScroll.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(idx)) setActiveIndex(idx);
          }
        });
      },
      { root: container, threshold: 0.6 },
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, [properties]);

  const handleManualScroll = (direction: "left" | "right") => {
    const newIndex =
      direction === "left"
        ? Math.max(0, activeIndex - 1)
        : Math.min(properties.length - 1, activeIndex + 1);
    scrollToCard(newIndex);
  };

  return (
    <section className="relative z-10 py-12 sm:py-16 bg-gradient-to-b from-[var(--paper)] via-[var(--carousel-bg-mid,)] to-[var(--paper)]">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full bg-[var(--marigold-deep)]/5 blur-[140px] pointer-events-none" />

      {/* Header na naka-align sa max-w-7xl container padding */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--forest-deep)] text-[var(--accent-gold)] text-[11px] font-extrabold uppercase tracking-[0.25em] shadow-sm mb-3.5">
            Mga Eksklusibong Alok
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-[var(--ink)] leading-tight tracking-tight">
              Tampok na{" "}
              <span className="relative inline-block">
                Paupahan
                <svg
                  aria-hidden="true"
                  className="absolute -bottom-1.5 left-0 w-full"
                  viewBox="0 0 200 8"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 6 Q25 1 50 5 Q75 9 100 4 Q125 -1 150 5 Q175 9 200 4"
                    stroke="var(--marigold)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>
          <p className="font-body mt-2.5 text-sm sm:text-base text-[var(--muted)] max-w-xl font-normal leading-relaxed">
            Pili at mataas ang kalidad na mga tirahan mula sa aming mga
            pinagkakatiwalaang at beripikadong kasosyong may-ari.
          </p>
        </div>
      </div>

      {/* ── Carousel (Full width track with edge padding) ── */}
      {isLoading ? (
        /* ── Skeleton row — mirrors the carousel's card sizing so there's no layout jump when real data lands ── */
        <div className="relative z-10 mt-4">
          <div
            className="flex gap-6 sm:gap-10 overflow-hidden py-6"
            style={{
              paddingLeft: "max(1.5rem, calc(50vw - 175px))",
              paddingRight: "max(1.5rem, calc(50vw - 175px))",
            }}
          >
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="w-[78vw] sm:w-[360px] lg:w-[400px] flex-shrink-0"
              >
                <PropertySkeleton />
              </div>
            ))}
          </div>
        </div>
      ) : properties.length === 0 ? (
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
          <EmptyState
            title="Walang Kasalukuyang Tampok na Paupahan"
            description="Kasalukuyan kaming nagbe-verify ng mga bagong property. Bisitahin muli mamaya!"
            actionLabel="I-refresh ang Listahan"
            onReset={() => window.location.reload()}
          />
        </div>
      ) : (
        <div className="relative z-10 mt-4">
          {/* scroll track is the grid reference for arrows.
              Use a CSS grid so the track and arrow layer share the same cell. */}
          <div className="relative grid grid-cols-1">
            {/* Scroll track — row 1, col 1 */}
            <div
              ref={scrollRef}
              className="col-start-1 row-start-1 flex gap-6 sm:gap-10 overflow-x-auto no-scrollbar py-6 snap-x snap-mandatory items-center"
              style={{
                paddingLeft: "max(1.5rem, calc(50vw - 175px))",
                paddingRight: "max(1.5rem, calc(50vw - 175px))",
              }}
            >
              {properties.map((property, index) => {
                const isCenter = index === activeIndex;
                return (
                  <div
                    key={property.id}
                    data-index={index}
                    onClick={() => scrollToCard(index)}
                    className={`carousel-card snap-center flex-shrink-0 cursor-pointer
                      w-[78vw] sm:w-[360px] lg:w-[400px]
                      transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                      ${
                        isCenter
                          ? "scale-100 opacity-100 z-25"
                          : "scale-[0.88] opacity-40 blur-[1px] z-10 hover:opacity-60"
                      }`}
                  >
                    <PropertyCard
                      property={property}
                      onViewDetails={onViewDetails}
                    />
                  </div>
                );
              })}
            </div>

            {/* Arrow overlay — row 1, col 1, same cell as track.
                pointer-events-none on wrapper so it doesn't block scroll;
                pointer-events-auto on each button to re-enable clicks. */}
            <div className="col-start-1 row-start-1 pointer-events-none relative z-30 flex items-center justify-between px-3 lg:px-6 max-w-7xl mx-auto w-full">
              <button
                onClick={() => handleManualScroll("left")}
                disabled={activeIndex === 0}
                aria-label="Previous Slide"
                className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full
                  bg-[var(--paper-card)]/90 backdrop-blur-md
                  border border-[var(--line)]
                  text-[var(--forest-deep)] shadow-lg
                  hover:bg-[var(--forest-deep)] hover:text-white hover:border-[var(--forest-deep)]
                  disabled:opacity-0 disabled:pointer-events-none
                  transition-all duration-300 active:scale-95
                  hidden sm:flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* spacer so right button hugs the right edge */}
              <div className="flex-1" />

              <button
                onClick={() => handleManualScroll("right")}
                disabled={activeIndex === properties.length - 1}
                aria-label="Next Slide"
                className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full
                  bg-[var(--paper-card)]/90 backdrop-blur-md
                  border border-[var(--line)]
                  text-[var(--forest-deep)] shadow-lg
                  hover:bg-[var(--forest-deep)] hover:text-white hover:border-[var(--forest-deep)]
                  disabled:opacity-0 disabled:pointer-events-none
                  transition-all duration-300 active:scale-95
                  hidden sm:flex"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Dot indicators */}
          {properties.length > 1 && (
            <div className="flex items-center justify-center gap-2.5 mt-2 pb-2">
              {properties.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToCard(index)}
                  aria-label={`Pumunta sa slide ${index + 1}`}
                  style={{
                    width: activeIndex === index ? "36px" : "8px",
                    height: "8px",
                    borderRadius: "9999px",
                    backgroundColor:
                      activeIndex === index
                        ? "var(--forest-deep)"
                        : "var(--muted)",
                    opacity: activeIndex === index ? 1 : 0.35,
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}