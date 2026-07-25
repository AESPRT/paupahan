"use client";

import { useState, useEffect } from "react";
import { TenantSettingsHeader } from "@/src/components/tenant/settings/TenantSettingsHeader";
import { TenantProfileForm } from "@/src/components/tenant/settings/TenantProfileForm";
import { TenantSecurityCard } from "@/src/components/tenant/settings/TenantSecurityCard";
import { TenantSettingsData } from "@/src/types/tenant/tenant-settings";
import { Footer } from "@/src/components/landing/Footer";
import { getTenantSettingsData } from "@/src/actions/tenant/tenant-actions";
import { useRouter } from "next/navigation";
import FullPageLoader from "@/src/components/ui/FullPageLoader";

export default function TenantSettingsPage() {
  const router = useRouter();
  const [settingsData, setSettingsData] = useState<TenantSettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTenantSettingsData().then((res) => {
      if (res.success && res.data) {
        setSettingsData(res.data);
      } else {
        router.push("/tenant/login");
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return <FullPageLoader message="Nag-load ang Settings..." />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <TenantSettingsHeader />

      {/* 2. Personal Profile Form (Dynamic Data) */}
      {settingsData && <TenantProfileForm initialData={settingsData} />}

      {/* 3. Security & Password Form */}
      <TenantSecurityCard />

      {/* 4. Footer */}
      <Footer showNavLinks={false} />
    </div>
  );
}