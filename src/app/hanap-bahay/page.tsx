"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/src/components/hanap-bahay/HeroSection";
import { FeaturedCarousel } from "@/src/components/hanap-bahay/FeaturedCarousel";
import { NewestListings } from "@/src/components/hanap-bahay/NewestListings";
import { MarketplaceResultsSection } from "@/src/components/hanap-bahay/MarketplaceResultsSection";
import { FooterCTA } from "@/src/components/hanap-bahay/FooterCTA";
import { Property, SearchFiltersState } from "@/src/types/property";
import { getMarketplaceProperties } from "@/src/actions/hanap-bahay/hanap-bahay-actions";

export default function HanapBahayPage() {
    const router = useRouter();
    const [properties, setProperties] = useState<Property[]>([]);
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

    // Client-side filtering batay sa filters state
    const filteredProperties = properties.filter((p) => {
        return true;
    });

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
    };

    return (
        <div className="min-h-screen bg-[#FAF7EF] text-[#153730] font-sans antialiased selection:bg-[#F0A93A] selection:text-[#153730]">
            {/* 1. Hero Section */}
            <HeroSection />

            {/* 2. Featured Properties Carousel (May Hero design theme na rin) */}
            <FeaturedCarousel
                properties={properties.filter(p => p.verifiedLandlord)}
                onViewDetails={handleViewDetails}
            />

            {/* 3. Newest Listings Section */}
            <NewestListings
                properties={properties}
                onViewDetails={handleViewDetails}
            />

            {/* 4. Main Search & Results Section Component */}
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

            {/* 5. Footer CTA Section */}
            <FooterCTA />
        </div>
    );
}