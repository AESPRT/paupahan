/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import TenantsClientWrapper from "@/src/components/admin/tenants/TenantsClientWrapper";
import { getTenantsData } from "@/src/actions/tenants-actions";
import FullPageLoader from "@/src/components/ui/FullPageLoader";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getTenantsData();
        setTenants(data || []);
      } catch (error) {
        console.error("Nabigong i-load ang tenants data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <FullPageLoader message="Nag-a-load ng tenants..." />;
  }

  return <TenantsClientWrapper initialTenants={tenants} />;
}