/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { UtilitiesClientWrapper } from "@/src/components/admin/utilities/UtilitiesClientWrapper";
import { Footer } from "@/src/components/landing/Footer";
import { getUtilitiesData } from "@/src/actions/utilities-actions";
import FullPageLoader from "@/src/components/ui/FullPageLoader";

export default function UtilitiesPage() {
  const [rates, setRates] = useState<any[]>([]);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getUtilitiesData();
        setRates(data.rates || []);
        setAmenities(data.amenities || []);
      } catch (error) {
        console.error("Nabigong i-load ang utilities data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <FullPageLoader message="Nag-a-load ng utilities..." />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Interactive Client Component na may dalang initial data */}
      <UtilitiesClientWrapper 
        initialRates={rates} 
        initialAmenities={amenities} 
      />

      <Footer showNavLinks={false} />
    </div>
  );
}