"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/src/components/hanap-bahay/HeroSection";
import { CategoryChips } from "@/src/components/hanap-bahay/CategoryChips";
import { FeaturedCarousel } from "@/src/components/hanap-bahay/FeaturedCarousel";
import { NewestListings } from "@/src/components/hanap-bahay/NewestListings";
import { MarketplaceResultsSection } from "@/src/components/hanap-bahay/MarketplaceResultsSection";
import { FooterCTA } from "@/src/components/hanap-bahay/FooterCTA";
import { Property, SearchFiltersState } from "@/src/types/property";
import { getMarketplaceProperties } from "@/src/actions/hanap-bahay/hanap-bahay-actions";

export default function HanapBahayPage() {
    const router = useRouter();
    const [properties, setProperties] = useState<Property[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [isLoading, startTransition] = useTransition();

    const resultsRef = useRef<HTMLElement>(null);

    const scrollToResults = () => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const [filters, setFilters] = useState<SearchFiltersState>({
        location: "",
        city: "",
        priceRange: [0, 50000],
        propertyType: "",
        availability: "",
        amenities: [],
        sort: "newest",
    });

    // Kunin ang mga datos mula sa DB gamit ang Server Action
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

    // Client-side filtering para sa mga kategorya at amenities
    const filteredProperties = properties.filter((p) => {
        if (selectedCategory !== "all" && !["pets", "parking", "wifi", "aircon"].includes(selectedCategory)) {
            if (p.type !== selectedCategory) return false;
        }
        if (selectedCategory === "pets" && !p.amenities.includes("Pets Allowed")) return false;
        if (selectedCategory === "parking" && !p.amenities.includes("Parking")) return false;
        if (selectedCategory === "wifi" && !p.amenities.includes("WiFi")) return false;
        if (selectedCategory === "aircon" && !p.amenities.includes("Aircon")) return false;

        return true;
    });

    const handleSearchSubmit = (loc: string, budget: string, type: string) => {
        startTransition(() => {
            setFilters((prev) => ({
                ...prev,
                location: loc,
                priceRange: budget ? [0, Number(budget)] : [0, 50000],
                propertyType: type,
            }));
            scrollToResults();
        });
    };

    const handleLocationClick = (city: string) => {
        startTransition(() => {
            setFilters((prev) => ({ ...prev, city }));
            scrollToResults();
        });
    };

    const handleViewDetails = (property: Property) => {
        router.push(`/hanap-bahay/${property.id}`);
    };

    const handleResetAllFilters = () => {
        setFilters({
            location: "",
            city: "",
            priceRange: [0, 50000],
            propertyType: "",
            availability: "",
            amenities: [],
            sort: "newest",
        });
        setSelectedCategory("all");
    };

    return (
        <div className="min-h-screen bg-[#FAF7EF] text-[#153730] font-sans antialiased selection:bg-[#F0A93A] selection:text-[#153730]">
            {/* 1. Hero Section */}
            <HeroSection
                onSearchSubmit={handleSearchSubmit}
                onLocationClick={handleLocationClick}
            />

            {/* 2. Quick Categories Chips */}
            <CategoryChips
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />

            {/* 3. Featured Properties Carousel */}
            <FeaturedCarousel
                properties={properties.filter(p => p.verifiedLandlord)}
                onViewDetails={handleViewDetails}
            />

            {/* 4. Newest Listings Section */}
            <NewestListings
                properties={properties}
                onViewDetails={handleViewDetails}
            />

            {/* 5. Main Search & Results Section Component */}
            <MarketplaceResultsSection
                sectionRef={resultsRef}
                properties={properties}
                filteredProperties={filteredProperties}
                filters={filters}
                onFilterChange={setFilters}
                isMobileFiltersOpen={isMobileFiltersOpen}
                onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
                onCloseMobileFilters={() => setIsMobileFiltersOpen(false)}
                isLoading={isLoading}
                onViewDetails={handleViewDetails}
                onResetFilters={handleResetAllFilters}
            />

            {/* 6. Footer CTA Section */}
            <FooterCTA />
        </div>
    );
}