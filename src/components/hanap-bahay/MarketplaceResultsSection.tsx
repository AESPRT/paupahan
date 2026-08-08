// src/components/hanap-bahay/MarketplaceResultsSection.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { ResultsHeader } from "@/src/components/hanap-bahay/ResultsHeader";
import { EmptyState } from "@/src/components/hanap-bahay/EmptyState";
import { PropertyCard } from "@/src/components/hanap-bahay/PropertyCard";
import { PropertySkeleton } from "@/src/components/hanap-bahay/PropertySkeleton";
import { PriceRangeSlider } from "@/src/components/hanap-bahay/PriceRangeSlider";
import { Property, SearchFiltersState } from "@/src/types/property";
import { RotateCcw, ChevronDown, Check, Sparkles, Wallet, Flame } from "lucide-react";

interface MarketplaceResultsSectionProps {
  filteredProperties: Property[];
  filters: SearchFiltersState;
  onFilterChange: (next: SearchFiltersState) => void;
  isMobileFiltersOpen: boolean;
  onOpenMobileFilters: () => void;
  onCloseMobileFilters: () => void;
  isLoading: boolean;
  onViewDetails: (property: Property) => void;
  onResetFilters: () => void;
}

const CITIES = [
  { label: "Lahat ng Lungsod", value: "" },
  { label: "Quezon City", value: "Quezon City" },
  { label: "Manila", value: "Manila" },
  { label: "Pasig", value: "Pasig" },
  { label: "Makati", value: "Makati" },
];

const PROPERTY_TYPES = [
  { label: "Lahat ng Uri", value: "" },
  { label: "Apartment", value: "apartment" },
  { label: "Boarding House", value: "boarding_house" },
  { label: "Solo Room", value: "solo_room" },
  { label: "Student Friendly", value: "student" },
  { label: "Family Home", value: "family" },
];

// Budget tiers — same thresholds/labels as before, now driven through PriceRangeSlider's `zones` prop.
const BUDGET_ZONES = [
  { upTo: 18000, label: "Budget-Friendly", color: "#1F5E4A", icon: Sparkles },
  { upTo: 35000, label: "Mid-Range Comfort", color: "#059669", icon: Wallet },
  { upTo: 50000, label: "Luxury / Premium", color: "#D97706", icon: Flame },
];

export function MarketplaceResultsSection({
  filteredProperties,
  filters,
  onFilterChange,
  onOpenMobileFilters,
  isLoading,
  onViewDetails,
  onResetFilters,
}: MarketplaceResultsSectionProps) {
  // States para sa custom dropdowns
  const [openCityDropdown, setOpenCityDropdown] = useState(false);
  const [openTypeDropdown, setOpenTypeDropdown] = useState(false);

  // Refs para sa click-outside detection
  const cityRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setOpenCityDropdown(false);
      }
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setOpenTypeDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCityLabel = CITIES.find(c => c.value === filters.city)?.label || "Lahat ng Lungsod";
  const selectedTypeLabel = PROPERTY_TYPES.find(t => t.value === filters.propertyType)?.label || "Lahat ng Uri";

  return (
    <section
      className="relative z-10 py-16 sm:py-24 bg-[var(--paper)]"
      style={{ backgroundColor: "var(--paper)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Modern Minimalist Section Header ── */}
        <div className="mb-8 sm:mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--forest-deep)]/15 bg-[var(--forest-deep)]/5 mb-3.5">
            <span className="h-2 w-2 rounded-full bg-[var(--marigold)] animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--forest-deep)]">
              Marketplace Direktoryo
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black text-[var(--ink)] leading-tight tracking-tight">
              Lahat ng{" "}
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
          <p className="font-body text-sm sm:text-base text-[var(--muted)] mt-2">
            Salain at hanapin ang eksaktong tirahan na babagay sa iyong pangangailangan.
          </p>
        </div>

        {/* ── Horizontal Top Filter Bar (Custom Modern Dropdowns & Premium Slider) ── */}
        <div className="mb-8 p-4 sm:p-6 rounded-3xl border border-[var(--line)] bg-[var(--paper-card)] shadow-sm backdrop-blur-md">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Filter Inputs Grid (Horizontal) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full lg:w-auto flex-1 items-center">

              {/* Custom City Filter Dropdown */}
              <div className="relative" ref={cityRef}>
                <label className="block text-[10px] font-extrabold uppercase tracking-[0.15em] text-[var(--muted)] mb-1.5">
                  Lungsod
                </label>
                <button
                  type="button"
                  onClick={() => { setOpenCityDropdown(!openCityDropdown); setOpenTypeDropdown(false); }}
                  className="w-full flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-xs sm:text-sm font-semibold text-[var(--forest-deep)] hover:border-[var(--marigold)] transition-all outline-none"
                >
                  <span className="truncate">{selectedCityLabel}</span>
                  <ChevronDown className={`h-4 w-4 text-[var(--muted)] transition-transform duration-300 ml-2 flex-shrink-0 ${openCityDropdown ? "rotate-180 text-[var(--marigold-deep)]" : ""}`} />
                </button>

                {openCityDropdown && (
                  <div className="absolute z-30 top-full left-0 right-0 mt-2 bg-[var(--paper-card)] border border-[var(--line)] rounded-2xl shadow-xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {CITIES.map((city) => (
                      <button
                        key={city.value}
                        type="button"
                        onClick={() => {
                          onFilterChange({ ...filters, city: city.value });
                          setOpenCityDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors text-left ${filters.city === city.value ? 'bg-[var(--forest-deep)] text-white' : 'text-[var(--forest-deep)] hover:bg-[var(--paper)]'}`}
                      >
                        <span>{city.label}</span>
                        {filters.city === city.value && <Check className="h-3.5 w-3.5 text-[var(--marigold)]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Property Type Filter Dropdown */}
              <div className="relative" ref={typeRef}>
                <label className="block text-[10px] font-extrabold uppercase tracking-[0.15em] text-[var(--muted)] mb-1.5">
                  Uri ng Tahanan
                </label>
                <button
                  type="button"
                  onClick={() => { setOpenTypeDropdown(!openTypeDropdown); setOpenCityDropdown(false); }}
                  className="w-full flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-xs sm:text-sm font-semibold text-[var(--forest-deep)] hover:border-[var(--marigold)] transition-all outline-none"
                >
                  <span className="truncate">{selectedTypeLabel}</span>
                  <ChevronDown className={`h-4 w-4 text-[var(--muted)] transition-transform duration-300 ml-2 flex-shrink-0 ${openTypeDropdown ? "rotate-180 text-[var(--marigold-deep)]" : ""}`} />
                </button>

                {openTypeDropdown && (
                  <div className="absolute z-30 top-full left-0 right-0 mt-2 bg-[var(--paper-card)] border border-[var(--line)] rounded-2xl shadow-xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto">
                    {PROPERTY_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          onFilterChange({ ...filters, propertyType: type.value });
                          setOpenTypeDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors text-left ${filters.propertyType === type.value ? 'bg-[var(--forest-deep)] text-white' : 'text-[var(--forest-deep)] hover:bg-[var(--paper)]'}`}
                      >
                        <span>{type.label}</span>
                        {filters.propertyType === type.value && <Check className="h-3.5 w-3.5 text-[var(--marigold)]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── PREMIUM PRICE RANGE SLIDER ── */}
              <div className="flex flex-col justify-center">
                <PriceRangeSlider
                  value={filters.priceRange[1]}
                  onChange={(v) => onFilterChange({ ...filters, priceRange: [0, v] })}
                  min={3000}
                  max={50000}
                  step={1000}
                  label="Max Badyet"
                  zones={BUDGET_ZONES}
                  hint="Slide upang salain"
                />
              </div>

            </div>

            {/* Action Buttons / Reset */}
            <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-[var(--line)]">
              <button
                onClick={onResetFilters}
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-[var(--line)] text-xs font-bold text-[var(--muted)] hover:text-[var(--forest-deep)] hover:bg-[var(--paper)] transition-all w-full lg:w-auto justify-center"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>I-reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Results Header (Sort + Counter) ── */}
        <div className="mb-8">
          <ResultsHeader
            totalCount={filteredProperties.length}
            sortOption={filters.sort}
            onSortChange={(sort) => onFilterChange({ ...filters, sort })}
            onOpenMobileFilters={onOpenMobileFilters}
          />
        </div>

        {/* ── Property Cards Grid Area (3 Columns for Perfect Card Width) ── */}
        <div className="w-full min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <PropertySkeleton key={n} />
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="flex items-center justify-center min-h-[400px] rounded-3xl border border-dashed border-[var(--line)] bg-white/40 p-8">
              <EmptyState onReset={onResetFilters} />
            </div>
          ) : (
            <div>
              {/* Result count counter */}
              <div className="flex items-center justify-between mb-6 px-1">
                <p className="font-body text-xs sm:text-sm text-[var(--muted)] font-medium">
                  Nagpapakita ng{" "}
                  <span className="text-[var(--ink)] font-extrabold text-base">
                    {filteredProperties.length}
                  </span>{" "}
                  {filteredProperties.length === 1
                    ? "paupahan"
                    : "mga paupahan"}
                </p>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredProperties.map((property, i) => (
                  <div
                    key={property.id}
                    className="group transition-all duration-300 hover:-translate-y-1"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <PropertyCard
                      property={property}
                      onViewDetails={onViewDetails}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}