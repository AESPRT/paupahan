// app/hanap-bahay/page.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/src/components/hanap-bahay/HeroSection";
import { FeaturedCarousel } from "@/src/components/hanap-bahay/FeaturedCarousel";
import { NewestListings } from "@/src/components/hanap-bahay/NewestListings";
import { FooterCTA } from "@/src/components/hanap-bahay/FooterCTA";
import { Property } from "@/src/types/property";
import { getMarketplaceProperties } from "@/src/actions/hanap-bahay/hanap-bahay-actions";

export default function HanapBahayPage() {
  const router = useRouter();

  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [newestProperties, setNewestProperties] = useState<Property[]>([]);
  const [isFeaturedLoading, startFeaturedTransition] = useTransition();
  const [isNewestLoading, startNewestTransition] = useTransition();

  // Featured — verified landlords only, small curated set for the carousel
  useEffect(() => {
    startFeaturedTransition(async () => {
      const data = await getMarketplaceProperties({
        sort: "newest",
      });
      setFeaturedProperties(data.filter((p) => p.verifiedLandlord).slice(0, 8));
    });
  }, []);

  // Newest — most recently listed, regardless of verification
  useEffect(() => {
    startNewestTransition(async () => {
      const data = await getMarketplaceProperties({
        sort: "newest",
      });
      setNewestProperties(data.slice(0, 6));
    });
  }, []);

  const handleViewDetails = (property: Property) => {
    router.push(`/hanap-bahay/${property.id}`);
  };

  return (
    <div className="min-h-screen bg-[#FAF7EF] text-[#153730] font-sans antialiased selection:bg-[#F0A93A] selection:text-[#153730]">
      <HeroSection />
      <FeaturedCarousel
        properties={featuredProperties}
        isLoading={isFeaturedLoading}
        onViewDetails={handleViewDetails}
      />
      <NewestListings
        properties={newestProperties}
        isLoading={isNewestLoading}
        onViewDetails={handleViewDetails}
      />
      <FooterCTA />
    </div>
  );
}
