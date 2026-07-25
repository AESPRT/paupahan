/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useTransition } from "react";
import { SettingsHeader } from "@/src/components/admin/settings/SettingsHeader";
import { SettingsTabs, TabType } from "@/src/components/admin/settings/SettingsTabs";
import { ProfileSettingsForm } from "@/src/components/admin/settings/ProfileSettingsForm";
import { PropertySettingsForm } from "@/src/components/admin/settings/PropertySettingsForm";
import { PaymentSettingsForm } from "@/src/components/admin/settings/PaymentSettingsForm";
import { SecuritySettingsForm } from "@/src/components/admin/settings/SecuritySettingsForm";
import { Footer } from "@/src/components/landing/Footer";
import { 
  getAdminSettings, 
  updateProfileSettings, 
  updatePropertySettings, 
  updatePaymentSettings, 
  updateSecuritySettings 
} from "@/src/actions/admin-settings";
import FullPageLoader from "@/src/components/ui/FullPageLoader";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();

  // Real States mula sa Database
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const [property, setProperty] = useState({
    propertyName: "",
    address: "",
    defaultGracePeriodDays: 5,
    lateFeePercentage: 0,
    waterRatePerCubic: 0,
    electricityRatePerKwh: 0,
  });

  const [payment, setPayment] = useState({
    gcashNumber: "",
    gcashName: "",
    mayaNumber: "",
    mayaName: "",
    bankName: "",
    bankAccountNo: "",
    bankAccountName: "",
    isGcashActive: false,
    isMayaActive: false,
    isBankActive: false,
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    autoRemindOverdue: true,
  });

  // Kunin ang data sa pag-load ng page
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const res = await getAdminSettings();
      if (res.success) {
        if (res.profile) setProfile(res.profile);
        if (res.property) setProperty(res.property);
        if (res.payment) setPayment(res.payment as any);
        if (res.notifications) setNotifications(res.notifications as any);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Handlers para sa pag-save bawat tab
  const handleSaveProfile = (updatedData: any) => {
    startTransition(async () => {
      const res = await updateProfileSettings(updatedData);
      if (res.success) {
        setProfile(updatedData);
        alert(res.message);
      } else {
        alert(res.error);
      }
    });
  };

  const handleSaveProperty = (updatedData: any) => {
    startTransition(async () => {
      const res = await updatePropertySettings(updatedData);
      if (res.success) {
        setProperty(updatedData);
        alert(res.message);
      } else {
        alert(res.error);
      }
    });
  };

  const handleSavePayment = (updatedData: any) => {
    startTransition(async () => {
      const res = await updatePaymentSettings(updatedData);
      if (res.success) {
        setPayment(updatedData);
        alert(res.message);
      } else {
        alert(res.error);
      }
    });
  };

  const handleSaveSecurity = (updatedData: any) => {
    startTransition(async () => {
      const res = await updateSecuritySettings(updatedData);
      if (res.success) {
        setNotifications(updatedData);
        alert(res.message);
      } else {
        alert(res.error);
      }
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header Banner Component */}
      <SettingsHeader />

      {/* Tabs Navigation Component */}
      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Active Tab Content */}
      <div className="mt-4">
        {isLoading ? (
          <FullPageLoader message="Kinukuha ang mga setting mula sa database..." />
        ) : (
          <>
            {activeTab === "profile" && (
              <ProfileSettingsForm initialData={profile} onSave={handleSaveProfile} />
            )}
            {activeTab === "property" && (
              <PropertySettingsForm initialData={property} onSave={handleSaveProperty} />
            )}
            {activeTab === "payment" && (
              <PaymentSettingsForm initialData={payment} onSave={handleSavePayment} />
            )}
            {activeTab === "security" && (
              <SecuritySettingsForm
                initialData={notifications}
                onSave={handleSaveSecurity}
              />
            )}
          </>
        )}
      </div>

      <Footer showNavLinks={false} />
    </div>
  );
}