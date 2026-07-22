"use client";

import { MOCK_UTILITIES_DATA } from "@/src/data/tenant-utilities";
import { UtilityHeader } from "@/src/components/tenant/utilities/UtilityHeader";
import { UtilityRateCard } from "@/src/components/tenant/utilities/UtilityRateCard";
import { UtilityCalculator } from "@/src/components/tenant/utilities/UtilityCalculator";
import { AmenityCard } from "@/src/components/tenant/utilities/AmenityCard";
import { Footer } from "@/src/components/landing/Footer";

export default function TenantUtilitiesPage() {
  const { rates, amenities } = MOCK_UTILITIES_DATA;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* 1. Header */}
      <UtilityHeader />

      {/* 2. Submeter Utility Rates Section */}
      <section className="space-y-3">
        <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
          Kasalukuyang Utility Rates (Per Unit)
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {rates.map((rate) => (
            <UtilityRateCard key={rate.id} rate={rate} />
          ))}
        </div>
      </section>

      {/* 3. Calculator Section */}
      <UtilityCalculator rates={rates} />

      {/* 4. Amenities Section */}
      <section className="space-y-3">
        <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
          Karagdagang Amenities at Bayarin (Amenities & Dues)
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {amenities.map((amenity) => (
            <AmenityCard key={amenity.id} amenity={amenity} />
          ))}
        </div>
      </section>

      <Footer showNavLinks = {false} />
    </div>
  );
}