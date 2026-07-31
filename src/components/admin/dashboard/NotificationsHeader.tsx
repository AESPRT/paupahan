"use client";

interface NotificationsHeaderProps {
  totalActivities: number;
  unreadCount?: number;
  onClearAll?: () => void;
}

export function NotificationsHeader({
  totalActivities,
  unreadCount = 0,
  onClearAll,
}: NotificationsHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-forest/20 bg-gradient-to-r from-forest via-forest-deep to-forest p-6 text-white shadow-md sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-marigold/20 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-marigold backdrop-blur-md">
              <svg
                className="h-3.5 w-3.5 shrink-0 text-marigold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span>Mga Aktibidad at Notipikasyon</span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-black sm:text-3xl lg:text-4xl">
              Mga Kamakailang Aktibidad
            </h1>
            <p className="mt-1 text-xs text-white/80 sm:text-sm">
              Suriin ang mga pinakahuling transaksyon, pagbabayad, at pagbabago sa iyong paupahan.
            </p>
          </div>

          {/* Button Action (Optional) */}
          {onClearAll && (
            <div className="flex w-full sm:w-auto sm:justify-end">
              <button
                onClick={onClearAll}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-coral px-5 py-3 font-mono-brand text-xs font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-coral-deep active:translate-y-0 sm:w-auto"
              >
                <svg
                  className="h-4 w-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Markahan Lahat bilang Nabasa</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-paper-card p-4 shadow-sm">
          <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            Kabuuan ng Aktibidad
          </span>
          <div className="mt-1 font-display text-2xl font-bold text-forest">
            {totalActivities}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-paper-card p-4 shadow-sm">
          <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            Hindi Pa Nababasa
          </span>
          <div className="mt-1 font-display text-2xl font-bold text-coral-deep">
            {unreadCount}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-paper-card p-4 shadow-sm">
          <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            Status ng System
          </span>
          <div className="mt-1 flex items-center gap-2 font-display text-2xl font-bold text-forest-deep">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-lg">Aktibo & Updated</span>
          </div>
        </div>
      </div>
    </div>
  );
}