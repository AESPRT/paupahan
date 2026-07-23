"use client";

import { AdminProfileData } from "@/src/types/admin/profile";

interface ProfileStatsProps {
  profile: AdminProfileData;
}

export function ProfileStats({ profile }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-line bg-paper-card p-5 shadow-sm">
        <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
          Hawak na Properties
        </span>
        <div className="mt-1 font-display text-2xl font-bold text-forest-deep">
          {profile.managedPropertiesCount}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-paper-card p-5 shadow-sm">
        <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
          Kabuuan ng mga Kwarto
        </span>
        <div className="mt-1 font-display text-2xl font-bold text-marigold-deep">
          {profile.totalRoomsCount}
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-paper-card p-5 shadow-sm">
        <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
          Aktibong Tenants
        </span>
        <div className="mt-1 font-display text-2xl font-bold text-forest">
          {profile.activeTenantsCount}
        </div>
      </div>
    </div>
  );
}