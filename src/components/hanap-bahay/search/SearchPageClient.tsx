"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MarketplaceResultsSection } from "@/src/components/hanap-bahay/MarketplaceResultsSection";
import { Property, SearchFiltersState } from "@/src/types/property";
import { getMarketplaceProperties } from "@/src/actions/hanap-bahay/hanap-bahay-actions";

function filtersFromParams(params: URLSearchParams): SearchFiltersState {
  return {
    location: params.get("location") ?? "",
    city: params.get("city") ?? "",
    priceRange: [
      Number(params.get("minPrice") ?? 0),
      Number(params.get("maxPrice") ?? 50000),
    ],
    propertyType: params.get("type") ?? "",
    availability: params.get("availability") ?? "",
    amenities: params.get("amenities")?.split(",").filter(Boolean) ?? [],
    sort: params.get("sort") ?? "newest",
  };
}

export function SearchPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<SearchFiltersState>(() =>
    filtersFromParams(searchParams),
  );
  const [properties, setProperties] = useState<Property[]>([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isLoading, startTransition] = useTransition();

  // URL is the source of truth — re-derive filters whenever it changes
  // (covers back/forward navigation too)
  useEffect(() => {
    setFilters(filtersFromParams(searchParams));
  }, [searchParams]);

  useEffect(() => {
    startTransition(async () => {
      const data = await getMarketplaceProperties({
        location: filters.location,
        city: filters.city,
        maxPrice: filters.priceRange[1],
        propertyType: filters.propertyType,
        sort: filters.sort,
      });
      setProperties(data);
    });
  }, [filters]);

  // When the user changes a filter, push it into the URL (shareable + back-safe)
  const handleFilterChange = useCallback(
    (next: SearchFiltersState) => {
      const params = new URLSearchParams();
      if (next.location) params.set("location", next.location);
      if (next.city) params.set("city", next.city);
      if (next.priceRange[0] > 0)
        params.set("minPrice", String(next.priceRange[0]));
      if (next.priceRange[1] < 50000)
        params.set("maxPrice", String(next.priceRange[1]));
      if (next.propertyType) params.set("type", next.propertyType);
      if (next.availability) params.set("availability", next.availability);
      if (next.amenities.length)
        params.set("amenities", next.amenities.join(","));
      if (next.sort !== "newest") params.set("sort", next.sort);

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      setFilters(next);
    },
    [pathname, router],
  );

  const handleResetAllFilters = () => {
    router.push(pathname, { scroll: false });
  };

  const handleViewDetails = (property: Property) => {
    router.push(`/hanap-bahay/${property.id}`);
  };

  return (
    <MarketplaceResultsSection
      filteredProperties={properties}
      filters={filters}
      onFilterChange={handleFilterChange}
      isMobileFiltersOpen={isMobileFiltersOpen}
      onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
      onCloseMobileFilters={() => setIsMobileFiltersOpen(false)}
      isLoading={isLoading}
      onViewDetails={handleViewDetails}
      onResetFilters={handleResetAllFilters}
    />
  );
}
