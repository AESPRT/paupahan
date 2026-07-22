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
              <span>🛠️</span> Property Maintenance & Repairs
            </div>
            <h1 className="mt-2 font-display text-2xl font-black sm:text-3xl lg:text-4xl">
              Mga Sira at Maintenance
            </h1>
            <p className="mt-1 text-xs text-white/80 sm:text-sm">
              Suriin ang mga ulat ng sira na ipinadala ng mga tenant mula sa kanilang kwarto.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur-md">
            <span className="font-mono-brand text-xs font-bold text-marigold">
              📱 Live Tenant Requests Feed
            </span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-paper-card p-4 shadow-sm">
          <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            Kailangang Asikasuhin (Pending)
          </span>
          <div className="mt-1 font-display text-2xl font-bold text-coral-deep">
            {totalPending}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-paper-card p-4 shadow-sm">
          <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            Kasalukuyang Ginagawa (In Progress)
          </span>
          <div className="mt-1 font-display text-2xl font-bold text-marigold-deep">
            {totalInProgress}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-paper-card p-4 shadow-sm">
          <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            Ayos Na (Resolved)
          </span>
          <div className="mt-1 font-display text-2xl font-bold text-forest">
            {totalResolved}
          </div>
        </div>
      </div>
    </div>
  );
}