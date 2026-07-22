"use client";

import { useState } from "react";
import { ProfileSettingsForm } from "@/src/components/admin/settings/ProfileSettingsForm";
import { PropertySettingsForm } from "@/src/components/admin/settings/PropertySettingsForm";
import { PaymentSettingsForm } from "@/src/components/admin/settings/PaymentSettingsForm";
import { SecuritySettingsForm } from "@/src/components/admin/settings/SecuritySettingsForm";
import { Footer } from "@/src/components/landing/Footer";

type TabType = "profile" | "property" | "payment" | "security";

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
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-forest/20 bg-gradient-to-r from-forest via-forest-deep to-forest p-6 text-white shadow-md sm:p-8">
        <h1 className="font-display text-2xl font-black sm:text-3xl">
          ⚙️ Admin Settings
        </h1>
        <p className="mt-1 text-xs text-white/80 sm:text-sm">
          Pamahalaan ang iyong account, paupahan rates, at payment gateways.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-line pb-3 overflow-x-auto">
        {[
          { id: "profile", label: "👤 Profile Settings" },
          { id: "property", label: "🏠 Property & Rates" },
          { id: "payment", label: "💳 Payment Methods" },
          { id: "security", label: "🔒 Security & Alerts" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`rounded-xl px-4 py-2 font-mono-brand text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-forest text-white shadow-sm"
                : "border border-line bg-paper text-muted hover:bg-line/40"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

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

      <Footer showNavLinks = {false} />
    </div>
  );
}