"use client";

import { useState } from "react";
import { SettingsHeader } from "@/src/components/admin/settings/SettingsHeader";
import { SettingsTabs, TabType } from "@/src/components/admin/settings/SettingsTabs";
import { ProfileSettingsForm } from "@/src/components/admin/settings/ProfileSettingsForm";
import { PropertySettingsForm } from "@/src/components/admin/settings/PropertySettingsForm";
import { PaymentSettingsForm } from "@/src/components/admin/settings/PaymentSettingsForm";
import { SecuritySettingsForm } from "@/src/components/admin/settings/SecuritySettingsForm";
import { Footer } from "@/src/components/landing/Footer";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  // Mock State Data
  const [profile, setProfile] = useState({
    fullName: "Juan Dela Cruz",
    email: "landlord@paupahan.ph",
    phone: "09171234567",
  });

  const [property, setProperty] = useState({
    propertyName: "Dela Cruz Apartment Complex",
    address: "123 Katipunan Ave, Quezon City",
    defaultGracePeriodDays: 5,
    lateFeePercentage: 3.5,
    waterRatePerCubic: 45.0,
    electricityRatePerKwh: 12.5,
  });

  const [payment, setPayment] = useState({
    gcashNumber: "09171234567",
    gcashName: "Juan D.",
    mayaNumber: "09171234567",
    mayaName: "Juan D.",
    bankName: "BDO Unibank",
    bankAccountNo: "001234567890",
    bankAccountName: "Juan Dela Cruz",
    isGcashActive: true,
    isMayaActive: true,
    isBankActive: false,
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: true,
    autoRemindOverdue: true,
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header Banner Component */}
      <SettingsHeader />

      {/* Tabs Navigation Component */}
      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Active Tab Content */}
      <div className="mt-4">
        {activeTab === "profile" && (
          <ProfileSettingsForm initialData={profile} onSave={setProfile} />
        )}
        {activeTab === "property" && (
          <PropertySettingsForm initialData={property} onSave={setProperty} />
        )}
        {activeTab === "payment" && (
          <PaymentSettingsForm initialData={payment} onSave={setPayment} />
        )}
        {activeTab === "security" && (
          <SecuritySettingsForm
            initialData={notifications}
            onSave={setNotifications}
          />
        )}
      </div>

      <Footer showNavLinks={false} />
    </div>
  );
}