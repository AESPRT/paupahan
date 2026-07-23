"use client";

import { TenantSettingsHeader } from "@/src/components/tenant/settings/TenantSettingsHeader";
import { TenantProfileForm } from "@/src/components/tenant/settings/TenantProfileForm";
import { TenantSecurityCard } from "@/src/components/tenant/settings/TenantSecurityCard";
import { TenantSettingsData } from "@/src/types/tenant/tenant-settings";
import { Footer } from "@/src/components/landing/Footer";

const MOCK_SETTINGS_DATA: TenantSettingsData = {
  fullName: "Juan Dela Cruz",
  email: "juandelacruz@example.com",
  phoneNumber: "09179876543",
  emergencyContactName: "Maria Dela Cruz (Kapatid)",
  emergencyContactPhone: "09181234567",
  roomName: "Room 102 - Ground Floor",
  propertyName: "Katipunan Residences",
  notifications: {
    smsAlerts: true,
    emailAlerts: true,
    billingReminders: true,
  },
};

export default function TenantSettingsPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <TenantSettingsHeader />

      {/* 2. Personal Profile Form */}
      <TenantProfileForm initialData={MOCK_SETTINGS_DATA} />

      {/* 3. Security & Password Form */}
      <TenantSecurityCard />

      {/* 4. Footer */}
      <Footer showNavLinks={false} />
    </div>
  );
}