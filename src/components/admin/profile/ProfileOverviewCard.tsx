"use client";

import { AdminProfileData } from "@/src/types/admin/profile";

interface ProfileOverviewCardProps {
  profile: AdminProfileData;
  onOpenLogoutModal: () => void;
}

export function ProfileOverviewCard({
  profile,
  onOpenLogoutModal,
}: ProfileOverviewCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-paper-card p-6 shadow-sm sm:p-8">
      {/* Background Accent */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-forest/5 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
        {/* Avatar Placeholder */}
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-forest-deep text-3xl font-black text-white shadow-md ring-4 ring-forest/10">
          {profile.fullName
            .split(" ")
            .map((n) => n[0])
            .join("")}
          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white bg-emerald-500" />
        </div>

        {/* Profile Info */}
        <div className="flex-1 space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-forest/10 px-3 py-0.5 text-xs font-bold text-forest">
            🛡️ {profile.role}
          </div>
          <h1 className="font-display text-2xl font-black text-forest-deep sm:text-3xl">
            {profile.fullName}
          </h1>
          <p className="text-xs font-medium text-muted">{profile.email}</p>
          <div className="pt-2 font-mono-brand text-[11px] text-muted">
            📅 Administrator simula noong {profile.joinedDate}
          </div>
        </div>

        {/* Logout Action */}
        <div className="shrink-0 pt-2 sm:pt-0">
          <button
            onClick={onOpenLogoutModal}
            className="inline-flex items-center gap-2 rounded-2xl border border-coral/30 bg-coral/10 px-5 py-2.5 font-mono-brand text-xs font-bold text-coral-deep transition-all hover:bg-coral hover:text-white active:scale-95"
          >
            🚪 Log Out
          </button>
        </div>
      </div>
    </div>
  );
}