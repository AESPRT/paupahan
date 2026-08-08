// app/hanap-bahay/page.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/src/components/hanap-bahay/HeroSection";
import { FeaturedCarousel } from "@/src/components/hanap-bahay/FeaturedCarousel";
import { HowItWorks } from "@/src/components/hanap-bahay/HowItWorks";
import { LatestPropertiesGrid } from "@/src/components/hanap-bahay/LatestPropertiesGrid";
import { FooterCTA } from "@/src/components/hanap-bahay/FooterCTA";
import { Property } from "@/src/types/property";
import { getMarketplaceProperties } from "@/src/actions/hanap-bahay/hanap-bahay-actions";

export default function HanapBahayPage() {
  const router = useRouter();

  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [isFeaturedLoading, startFeaturedTransition] = useTransition();

  // Fetch properties data
  useEffect(() => {
    startFeaturedTransition(async () => {
      try {
        const data = await getMarketplaceProperties({ sort: "newest" });
        setFeaturedProperties(data.filter((p) => p.verifiedLandlord).slice(0, 8));
        setAllProperties(data.slice(0, 6));
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    });
  }, []);

  const handleViewDetails = (property: Property) => {
    router.push(`/hanap-bahay/${property.id}`);
  };

  return (
    <div className="min-h-screen bg-[#FAF7EF] text-[#153730] font-sans antialiased selection:bg-[#F0A93A] selection:text-[#153730] overflow-x-hidden">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Featured Carousel */}
      <FeaturedCarousel
        properties={featuredProperties}
        isLoading={isFeaturedLoading}
        onViewDetails={handleViewDetails}
      />

      {/* 3. How It Works Section */}
      <HowItWorks />

      {/* 4. Latest Properties Grid */}
      <LatestPropertiesGrid
        properties={allProperties}
        onViewDetails={handleViewDetails}
        onViewAll={() => router.push('/hanap-bahay/search')}
      />

      {/* 5. Footer CTA (Naka-angkla nang tuwid sa dulo nang walang rounded edges) */}
      <FooterCTA />
    </div>
  );
}