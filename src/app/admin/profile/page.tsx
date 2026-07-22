"use client";

import { useState } from "react";
import { ProfileOverviewCard } from "@/src/components/admin/profile/ProfileOverviewCard";
import { ProfileStats } from "@/src/components/admin/profile/ProfileStats";
import { ActivityLogsCard } from "@/src/components/admin/profile/ActivityLogsCard";
import { LogoutModal } from "@/src/components/admin/profile/LogoutModal";
import { AdminProfileData, ActivityLog } from "@/src/types/profile";

const MOCK_PROFILE: AdminProfileData = {
  id: "admin-01",
  fullName: "Juan Dela Cruz",
  role: "Main Landlord & Property Owner",
  email: "landlord@paupahan.ph",
  phone: "09171234567",
  joinedDate: "Enero 2024",
  managedPropertiesCount: 3,
  totalRoomsCount: 24,
  activeTenantsCount: 18,
};

const MOCK_LOGS: ActivityLog[] = [
  {
    id: "l1",
    action: "In-update ang status ng Maintenance Ticket TICK-102 to In Progress",
    timestamp: "Kanina, 2:30 PM",
    category: "Maintenance",
  },
  {
    id: "l2",
    action: "Nagtala ng bayad para sa Room 101 (Juan Dela Cruz)",
    timestamp: "Kahapon, 10:15 AM",
    category: "Billing",
  },
  {
    id: "l3",
    action: "Nagdagdag ng bagong tenant sa Room 202",
    timestamp: "Hulyo 18, 2026",
    category: "Tenant",
  },
  {
    id: "l4",
    action: "Binago ang password ng Admin Account",
    timestamp: "Hulyo 10, 2026",
    category: "Security",
  },
];

export default function ProfilePage() {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    // Ilagay dito ang auth logout logic (e.g. supabase/firebase logout, clearing tokens, redirecting to /login)
    alert("Naka-log out ka na!");
    window.location.href = "/admin/login";
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Banner Profile Overview */}
      <ProfileOverviewCard
        profile={MOCK_PROFILE}
        onOpenLogoutModal={() => setIsLogoutModalOpen(true)}
      />

      {/* Property Overview Stats */}
      <ProfileStats profile={MOCK_PROFILE} />

      {/* Recent Admin Activity History */}
      <ActivityLogsCard logs={MOCK_LOGS} />

      {/* Confirmation Modal for Logout */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={handleLogout}
      />
    </div>
  );
}