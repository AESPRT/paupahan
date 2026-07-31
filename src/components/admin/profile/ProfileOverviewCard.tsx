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
  // Kunin ang initials mula sa fullName
  const initials = profile.fullName
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line/80 bg-paper-card p-6 shadow-xs sm:p-8 transition-all hover:border-line">
      {/* Subtle Background Glow Accent */}
      <div 
        className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-forest/5 blur-3xl" 
        aria-hidden="true" 
      />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
        {/* Avatar Placeholder */}
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-forest-deep font-mono-brand text-2xl font-black text-white shadow-xs ring-4 ring-forest/10 sm:h-22 sm:w-22">
          {initials}
          <span 
            className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-paper-card bg-emerald-500 shadow-2xs" 
            title="Active Online"
          />
        </div>

        {/* Profile Info */}
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-forest/10 border border-forest/15 px-3 py-0.5 font-mono-brand text-[11px] font-bold text-forest">
              {/* SVG Shield Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 shrink-0">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              {profile.role}
            </span>
          </div>

          <h1 className="font-display text-2xl font-black text-forest-deep sm:text-3xl tracking-tight truncate">
            {profile.fullName}
          </h1>

          <p className="text-xs font-medium text-muted truncate">{profile.email}</p>

          <div className="pt-1">
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-paper border border-line/60 px-2.5 py-1 font-mono-brand text-[11px] text-muted">
              {/* SVG Calendar Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0 text-muted">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>Administrator simula noong {profile.joinedDate}</span>
            </div>
          </div>
        </div>

        {/* Logout Action */}
        <div className="shrink-0 pt-2 sm:pt-0">
          <button
            type="button"
            onClick={onOpenLogoutModal}
            className="inline-flex items-center gap-2 rounded-xl border border-coral/30 bg-coral/10 px-4 py-2.5 font-mono-brand text-xs font-bold text-coral-deep transition-all duration-200 hover:bg-coral hover:text-white active:scale-[0.98] cursor-pointer shadow-2xs"
          >
            {/* SVG Logout Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}