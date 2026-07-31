"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Flame,
  Star,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Property } from "@/src/types/property";
import { PropertyCard } from "./PropertyCard";
import { PropertySkeleton } from "./PropertySkeleton";
import { EmptyState } from "./EmptyState";

interface NewestListingsProps {
  properties: Property[];
  isLoading?: boolean;
  onViewDetails: (property: Property) => void;
}

const TABS = [
  { id: "today", label: "Ngayon", Icon: Flame },
  { id: "yesterday", label: "Kahapon", Icon: Star },
  { id: "this_week", label: "Ngayong Linggo", Icon: CalendarDays },
] as const;

type TabId = (typeof TABS)[number]["id"];

const EMPTY_COPY: Record<TabId, { title: string; description: string }> = {
  today: {
    title: "Walang bagong paupahan ngayong araw",
    description:
      "Wala pang nai-post ngayong araw. Subukang tingnan ang ibang tab.",
  },
  yesterday: {
    title: "Walang bagong paupahan kahapon",
    description:
      "Walang naitalang listahan kahapon. Tingnan ang 'Ngayon' o 'Ngayong Linggo'.",
  },
  this_week: {
    title: "Walang bagong paupahan ngayong linggo",
    description:
      "Wala kaming makitang bagong tahanan sa linggong ito. Balikan mamaya.",
  },
};

export function NewestListings({
  properties,
  isLoading = false,
  onViewDetails,
}: NewestListingsProps) {
  const [tab, setTab] = useState<TabId>("today");
  const [activeIndex, setActiveIndex] = useState(0);
  // ✅ FIX 2: lock flag — prevents observer from overriding a programmatic scroll
  const isProgrammaticScroll = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredProperties = properties.filter((p) => {
    if (tab === "today") return p.addedTime === "today";
    if (tab === "yesterday") return p.addedTime === "yesterday";
    return true;
  });

  const activeTab = TABS.find((t) => t.id === tab)!;

  useEffect(() => {
    setActiveIndex(0);
    scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [tab]);

  const scrollToCard = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const cards = container.querySelectorAll(".newest-card");
    const target = cards[index] as HTMLElement;
    if (!target) return;

    // ✅ FIX 2: set index immediately + lock observer for 800ms (scroll duration)
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
    const cards = container.querySelectorAll(".newest-card");
    const observer = new IntersectionObserver(
      (entries) => {
        // ✅ FIX 2: ignore observer callbacks during programmatic scroll
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
  }, [filteredProperties]);

  const handleArrow = (dir: "left" | "right") => {
    const next =
      dir === "left"
        ? Math.max(0, activeIndex - 1)
        : Math.min(filteredProperties.length - 1, activeIndex + 1);
    scrollToCard(next);
  };

  return (
    <section
      className="relative z-10 py-20 lg:py-28"
      style={{ backgroundColor: "var(--paper)" }}
    >
      <div className="absolute inset-0 bg-[var(--paper)]" aria-hidden="true" />

      {/* ── Header ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--marigold-deep)]">
              <Sparkles className="h-3.5 w-3.5" />
              Sariwang Salta
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-[var(--ink)] leading-tight tracking-tight">
              Bagong Idinagdag{" "}
              <span className="relative inline-block">
                na Tahanan
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
            <p className="font-body text-sm text-[var(--muted)] mt-1 max-w-sm leading-relaxed">
              Mga pinakabagong inilunsad na paupahan — bago pa mapuno.
            </p>
          </div>

          <div
            className="flex items-center self-start sm:self-auto bg-[var(--paper-card)] border border-[var(--line)] rounded-2xl p-1 shadow-sm"
            role="tablist"
          >
            {TABS.map((t) => {
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={isActive}
                  disabled={isLoading}
                  onClick={() => setTab(t.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 select-none
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--forest-deep)]
                    disabled:opacity-40 disabled:cursor-not-allowed
                    ${
                      isActive
                        ? "bg-[var(--forest-deep)] text-white shadow-md"
                        : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--line)]/50"
                    }`}
                >
                  <t.Icon
                    className={`h-4 w-4 flex-shrink-0 transition-colors duration-300 ${isActive ? "text-[var(--marigold)]" : "text-current"}`}
                  />
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className="sm:hidden">
                    {t.id === "today"
                      ? "Ngayon"
                      : t.id === "yesterday"
                        ? "Kahapon"
                        : "Linggo"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {!isLoading && filteredProperties.length > 0 && (
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-[var(--forest-deep)] bg-[var(--forest-deep)]/8 px-3 py-1.5 rounded-full whitespace-nowrap">
              <span
                className="h-1.5 w-1.5 rounded-full bg-[var(--marigold)] animate-pulse"
                aria-hidden="true"
              />
              {filteredProperties.length} bagong listahan{" "}
              {activeTab.label.toLowerCase()}
            </span>
            <div className="h-px flex-1 bg-[var(--line)]" />
          </div>
        )}
      </div>

      {/* ── Carousel ── */}
      {isLoading ? (
        /* ── Skeleton row — mirrors the carousel's card sizing so there's no layout jump when real data lands ── */
        <div className="relative z-10 mt-6">
          <div
            className="flex gap-6 sm:gap-10 overflow-hidden py-10"
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
      ) : filteredProperties.length === 0 ? (
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
          <EmptyState
            title={EMPTY_COPY[tab].title}
            description={EMPTY_COPY[tab].description}
            actionLabel="Ipakita ang Ngayon"
            onReset={() => setTab("today")}
          />
        </div>
      ) : (
        <div className="relative z-10 mt-6">
          {/* ✅ FIX 1: scroll track is the grid reference for arrows.
              Use a CSS grid so the track and arrow layer share the same height. */}
          <div className="relative grid grid-cols-1">
            {/* Scroll track — row 1, col 1 */}
            <div
              ref={scrollRef}
              className="col-start-1 row-start-1 flex gap-6 sm:gap-10 overflow-x-auto no-scrollbar py-10 snap-x snap-mandatory items-center"
              style={{
                paddingLeft: "max(1.5rem, calc(50vw - 175px))",
                paddingRight: "max(1.5rem, calc(50vw - 175px))",
              }}
            >
              {filteredProperties.map((property, index) => {
                const isCenter = index === activeIndex;
                return (
                  <div
                    key={property.id}
                    data-index={index}
                    onClick={() => scrollToCard(index)}
                    className={`newest-card snap-center flex-shrink-0 cursor-pointer
                      w-[78vw] sm:w-[360px] lg:w-[400px]
                      transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                      ${
                        isCenter
                          ? "scale-100 opacity-100 z-20"
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

            {/* ✅ FIX 1: Arrow overlay — row 1, col 1, same cell as track.
                pointer-events-none on wrapper so it doesn't block scroll;
                pointer-events-auto on each button to re-enable clicks. */}
            <div className="col-start-1 row-start-1 pointer-events-none relative z-30 flex items-center justify-between px-3 lg:px-6">
              <button
                onClick={() => handleArrow("left")}
                disabled={activeIndex === 0}
                aria-label="Previous"
                className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full
                  bg-[var(--paper-card)] border border-[var(--line)]
                  text-[var(--forest-deep)] shadow-xl
                  hover:bg-[var(--forest-deep)] hover:text-white hover:border-[var(--forest-deep)]
                  disabled:opacity-0 disabled:pointer-events-none
                  transition-all duration-300 active:scale-90
                  hidden sm:flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* spacer so right button hugs the right edge */}
              <div className="flex-1" />

              <button
                onClick={() => handleArrow("right")}
                disabled={activeIndex === filteredProperties.length - 1}
                aria-label="Next"
                className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full
                  bg-[var(--paper-card)] border border-[var(--line)]
                  text-[var(--forest-deep)] shadow-xl
                  hover:bg-[var(--forest-deep)] hover:text-white hover:border-[var(--forest-deep)]
                  disabled:opacity-0 disabled:pointer-events-none
                  transition-all duration-300 active:scale-90
                  hidden sm:flex"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Dot indicators */}
          {filteredProperties.length > 1 && (
            <div className="flex items-center justify-center gap-2.5 mt-2 pb-2">
              {filteredProperties.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToCard(index)}
                  aria-label={`Slide ${index + 1}`}
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
