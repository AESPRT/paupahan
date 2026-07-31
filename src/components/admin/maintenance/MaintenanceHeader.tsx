"use client";

interface MaintenanceHeaderProps {
  totalPending: number;
  totalInProgress: number;
  totalResolved: number;
}

export function MaintenanceHeader({
  totalPending,
  totalInProgress,
  totalResolved,
}: MaintenanceHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-forest/20 bg-gradient-to-r from-forest via-forest-deep to-forest p-6 text-white shadow-md sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-marigold/20 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-marigold backdrop-blur-md">
              <svg className="h-3.5 w-3.5 shrink-0 text-marigold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Property Maintenance & Repairs</span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-black sm:text-3xl lg:text-4xl">
              Mga Sira at Maintenance
            </h1>
            <p className="mt-1 text-xs text-white/80 sm:text-sm">
              Suriin ang mga ulat ng sira na ipinadala ng mga tenant mula sa kanilang kwarto.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur-md">
            <svg className="h-4 w-4 shrink-0 text-marigold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="font-mono text-xs font-semibold text-marigold">
              Live Tenant Requests Feed
            </span>
          </div>
        </div>
      </div>

      {/* Modern Minimalist Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Pending Card */}
        <div className="group rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-xl transition-all duration-300 hover:border-rose-200 hover:bg-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Pending Requests
            </span>
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900">
              {totalPending}
            </div>
            <span className="inline-flex items-center rounded-md border border-rose-200/60 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
              Kailangang Asikasuhin
            </span>
          </div>
        </div>

        {/* In Progress Card */}
        <div className="group rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-xl transition-all duration-300 hover:border-amber-200 hover:bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              In Progress
            </span>
            <span className="flex h-2 w-2 rounded-full bg-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900">
              {totalInProgress}
            </div>
            <span className="inline-flex items-center rounded-md border border-amber-200/60 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              Kasalukuyang Ginagawa
            </span>
          </div>
        </div>

        {/* Resolved Card */}
        <div className="group rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-xs backdrop-blur-xl transition-all duration-300 hover:border-emerald-200 hover:bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Resolved
            </span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900">
              {totalResolved}
            </div>
            <span className="inline-flex items-center rounded-md border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              Ayos Na
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}