"use client";

import { ResultsHeader } from "@/src/components/hanap-bahay/ResultsHeader";
import { FilterSidebar } from "@/src/components/hanap-bahay/FilterSidebar";
import { EmptyState } from "@/src/components/hanap-bahay/EmptyState";
import { PropertyCard } from "@/src/components/hanap-bahay/PropertyCard";
import { PropertySkeleton } from "@/src/components/hanap-bahay/PropertySkeleton";
import { Property, SearchFiltersState } from "@/src/types/property";

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

export function MarketplaceResultsSection({
  filteredProperties,
  filters,
  onFilterChange,
  isMobileFiltersOpen,
  onOpenMobileFilters,
  onCloseMobileFilters,
  isLoading,
  onViewDetails,
  onResetFilters,
}: MarketplaceResultsSectionProps) {
  return (
    <section
      className="relative z-10 py-16 lg:py-24"
      style={{ backgroundColor: "var(--paper)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Section eyebrow ── */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--marigold-deep)] mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--marigold)] animate-pulse" />
            Mga Paupahan
          </div>
          <div className="h-px w-full bg-[var(--line)]" />
        </div>

        {/* ── Results header (sort + mobile filter toggle) ── */}
        <ResultsHeader
          totalCount={filteredProperties.length}
          sortOption={filters.sort}
          onSortChange={(sort) => onFilterChange({ ...filters, sort })}
          onOpenMobileFilters={onOpenMobileFilters}
        />

        {/* ── Main layout: sidebar + grid ── */}
        <div className="flex gap-6 lg:gap-8 items-start mt-6">
          <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0 sticky top-6 self-start">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper-card)] shadow-sm overflow-hidden">
              <FilterSidebar
                filters={filters}
                onFilterChange={onFilterChange}
                isOpenMobile={isMobileFiltersOpen}
                onCloseMobile={onCloseMobileFilters}
              />
            </div>
          </aside>

          <div className="lg:hidden">
            <FilterSidebar
              filters={filters}
              onFilterChange={onFilterChange}
              isOpenMobile={isMobileFiltersOpen}
              onCloseMobile={onCloseMobileFilters}
            />
          </div>

          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <PropertySkeleton key={n} />
                ))}
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <EmptyState onReset={onResetFilters} />
              </div>
            ) : (
              <>
                <p className="font-body text-xs text-[var(--muted)] font-medium mb-4">
                  Nagpapakita ng{" "}
                  <span className="text-[var(--ink)] font-bold">
                    {filteredProperties.length}
                  </span>{" "}
                  {filteredProperties.length === 1
                    ? "paupahan"
                    : "mga paupahan"}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredProperties.map((property, i) => (
                    <div
                      key={property.id}
                      className="group transition-all duration-500 hover:-translate-y-1.5"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <PropertyCard
                        property={property}
                        onViewDetails={onViewDetails}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
