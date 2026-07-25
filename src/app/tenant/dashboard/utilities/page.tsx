/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { UtilityHeader } from "@/src/components/tenant/utilities/UtilityHeader";
import { UtilityRateCard } from "@/src/components/tenant/utilities/UtilityRateCard";
import { UtilityCalculator } from "@/src/components/tenant/utilities/UtilityCalculator";
import { AmenityCard } from "@/src/components/tenant/utilities/AmenityCard";
import { Footer } from "@/src/components/landing/Footer";
import { getTenantUtilitiesAndAmenities } from "@/src/actions/tenant/utility-actions"; // 👈 I-import ang tamang action
import FullPageLoader from "@/src/components/ui/FullPageLoader";

export default function TenantUtilitiesPage() {
  const [rates, setRates] = useState<any[]>([]);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getTenantUtilitiesAndAmenities();
        if (result.success) {
          setRates(result.rates);
          setAmenities(result.amenities);
        }
      } catch (error) {
        console.error("Nabigong i-load ang utility data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <FullPageLoader message="Nag-load ng utility rates..." />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* 1. Header */}
      <UtilityHeader />

      {/* 2. Submeter Utility Rates Section */}
      <section className="space-y-3">
        <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
          Kasalukuyang Utility Rates (Per Unit)
        </h2>
        {rates.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {rates.map((rate) => (
              <UtilityRateCard key={rate.id} rate={rate} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Wala pang nakatakdang utility rates sa sistema.</p>
        )}
      </section>

      {/* 3. Calculator Section */}
      <UtilityCalculator rates={rates} />

      {/* 4. Amenities Section */}
      <section className="space-y-3">
        <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
          Karagdagang Amenities at Bayarin (Amenities & Dues)
        </h2>
        {amenities.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {amenities.map((amenity) => (
              <AmenityCard key={amenity.id} amenity={amenity} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted">Wala kang kasalukuyang nakatalagang amenities sa iyong lease.</p>
        )}
      </section>

      <Footer showNavLinks={false} />
    </div>
  );
}