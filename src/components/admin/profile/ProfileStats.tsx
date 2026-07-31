"use client";

import { AdminProfileData } from "@/src/types/admin/profile";

interface ProfileStatsProps {
  profile: AdminProfileData;
}

export function ProfileStats({ profile }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Hawak na Properties */}
      <div className="group relative overflow-hidden rounded-3xl border border-line/80 bg-paper-card p-5 shadow-xs transition-all duration-200 hover:border-line hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-mono-brand text-[10px] font-bold uppercase tracking-wider text-muted">
            Hawak na Properties
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest/10 text-forest">
            {/* Building Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
              <path d="M9 22v-4h6v4" />
              <path d="M8 6h.01" />
              <path d="M16 6h.01" />
              <path d="M12 6h.01" />
              <path d="M12 10h.01" />
              <path d="M12 14h.01" />
              <path d="M16 10h.01" />
              <path d="M16 14h.01" />
              <path d="M8 10h.01" />
              <path d="M8 14h.01" />
            </svg>
          </div>
        </div>
        <div className="mt-2 font-display text-3xl font-black text-forest-deep tracking-tight">
          {profile.managedPropertiesCount}
        </div>
      </div>

      {/* Kabuuan ng mga Kwarto */}
      <div className="group relative overflow-hidden rounded-3xl border border-line/80 bg-paper-card p-5 shadow-xs transition-all duration-200 hover:border-line hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-mono-brand text-[10px] font-bold uppercase tracking-wider text-muted">
            Kabuuan ng mga Kwarto
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-marigold-deep/10 text-marigold-deep">
            {/* Door/Room Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" />
              <path d="M2 20h20" />
              <path d="M14 12v.01" />
            </svg>
          </div>
        </div>
        <div className="mt-2 font-display text-3xl font-black text-marigold-deep tracking-tight">
          {profile.totalRoomsCount}
        </div>
      </div>

      {/* Aktibong Tenants */}
      <div className="group relative overflow-hidden rounded-3xl border border-line/80 bg-paper-card p-5 shadow-xs transition-all duration-200 hover:border-line hover:shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-mono-brand text-[10px] font-bold uppercase tracking-wider text-muted">
            Aktibong Tenants
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest/10 text-forest">
            {/* Users Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
        </div>
        <div className="mt-2 font-display text-3xl font-black text-forest tracking-tight">
          {profile.activeTenantsCount}
        </div>
      </div>
    </div>
  );
}