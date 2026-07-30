"use client";

import { ResultsHeader } from "@/src/components/hanap-bahay/ResultsHeader";
import { FilterSidebar } from "@/src/components/hanap-bahay/FilterSidebar";
import { EmptyState } from "@/src/components/hanap-bahay/EmptyState";
import { PropertyCard } from "@/src/components/hanap-bahay/PropertyCard";
import { PropertySkeleton } from "@/src/components/hanap-bahay/PropertySkeleton";
import { Property, SearchFiltersState } from "@/src/types/property";

interface MarketplaceResultsSectionProps {
    sectionRef: React.RefObject<HTMLElement | null>;
    properties: Property[];
    filteredProperties: Property[];
    filters: SearchFiltersState;
    onFilterChange: React.Dispatch<React.SetStateAction<SearchFiltersState>>;
    isMobileFiltersOpen: boolean;
    onOpenMobileFilters: () => void;
    onCloseMobileFilters: () => void;
    isLoading: boolean;
    onViewDetails: (property: Property) => void;
    onResetFilters: () => void;
}

export function MarketplaceResultsSection({
    sectionRef,
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
        <section ref={sectionRef} className="py-16 bg-[#FAF7EF]" id="results">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <ResultsHeader
                    totalCount={filteredProperties.length}
                    sortOption={filters.sort}
                    onSortChange={(sort) => onFilterChange((prev) => ({ ...prev, sort }))}
                    onOpenMobileFilters={onOpenMobileFilters}
                />

                <div className="flex gap-8 items-start">
                    {/* Filter Sidebar (Desktop & Mobile Modal) */}
                    <FilterSidebar
                        filters={filters}
                        onFilterChange={onFilterChange}
                        isOpenMobile={isMobileFiltersOpen}
                        onCloseMobile={onCloseMobileFilters}
                    />

                    {/* Results Grid */}
                    <div className="flex-1">
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                    <PropertySkeleton key={n} />
                                ))}
                            </div>
                        ) : filteredProperties.length === 0 ? (
                            <EmptyState onReset={onResetFilters} />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProperties.map((property) => (
                                    <PropertyCard
                                        key={property.id}
                                        property={property}
                                        onViewDetails={onViewDetails}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}