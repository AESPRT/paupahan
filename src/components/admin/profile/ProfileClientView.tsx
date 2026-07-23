"use client";

import { useState } from "react";
import { ProfileOverviewCard } from "./ProfileOverviewCard";
import { ProfileStats } from "./ProfileStats";
import { ActivityLogsCard } from "./ActivityLogsCard";
import { LogoutModal } from "./LogoutModal";
import { AdminProfileData, ActivityLog } from "@/src/types/admin/profile";

interface ProfileClientViewProps {
  profileData: AdminProfileData;
  mockLogs: ActivityLog[];
  onConfirmLogout: () => void;
}

export function ProfileClientView({
  profileData,
  mockLogs,
  onConfirmLogout,
}: ProfileClientViewProps) {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Banner Profile Overview */}
      <ProfileOverviewCard
        profile={profileData}
        onOpenLogoutModal={() => setIsLogoutModalOpen(true)}
      />

      {/* Property Overview Stats */}
      <ProfileStats profile={profileData} />

      {/* Recent Admin Activity History */}
      <ActivityLogsCard logs={mockLogs} />

      {/* Confirmation Modal for Logout */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={onConfirmLogout}
      />
    </div>
  );
}