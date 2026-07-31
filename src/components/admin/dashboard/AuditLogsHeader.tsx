"use client";

interface AuditLogsHeaderProps {
  totalLogs: number;
  todayLogsCount?: number;
}

export function AuditLogsHeader({
  totalLogs,
  todayLogsCount = 0,
}: AuditLogsHeaderProps) {
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Security & Traceability</span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-black sm:text-3xl lg:text-4xl">
              Audit Logs at Rehistro
            </h1>
            <p className="mt-1 text-xs text-white/80 sm:text-sm">
              Suriin ang talaan ng mga pagbabago, pag-update sa database, at aktibidad ng mga user sa system.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-paper-card p-4 shadow-sm">
          <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            Kabuuan ng Audit Logs
          </span>
          <div className="mt-1 font-display text-2xl font-bold text-forest">
            {totalLogs}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-paper-card p-4 shadow-sm">
          <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            Aktibidad Ngayong Araw
          </span>
          <div className="mt-1 font-display text-2xl font-bold text-marigold-deep">
            {todayLogsCount}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-paper-card p-4 shadow-sm">
          <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            System Integrity
          </span>
          <div className="mt-1 flex items-center gap-2 font-display text-2xl font-bold text-forest-deep">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-lg">Secured & Logged</span>
          </div>
        </div>
      </div>
    </div>
  );
}