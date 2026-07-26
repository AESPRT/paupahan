/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import UnitsClientWrapper from "@/src/components/admin/units/UnitsClientWrapper";
import { getUnitsData } from "@/src/actions/units-actions";
import FullPageLoader from "@/src/components/ui/FullPageLoader";

export default function UnitsPage() {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getUnitsData();
        setUnits(data || []);
      } catch (error) {
        console.error("Nabigong i-load ang units data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <FullPageLoader message="Nag-a-load ng units..." />;
  }

  return (
    <UnitsClientWrapper 
      initialUnits={units}
    />
  );
}