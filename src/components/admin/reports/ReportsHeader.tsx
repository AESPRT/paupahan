"use client";

import { FinancialReportSummary } from "@/src/types/report";

interface ReportsHeaderProps {
  summary: FinancialReportSummary;
  onGenerateAll: () => void;
}

export function ReportsHeader({ summary, onGenerateAll }: ReportsHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-forest/20 bg-gradient-to-r from-forest via-forest-deep to-forest p-6 text-white shadow-md sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-marigold/20 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-marigold backdrop-blur-md">
              <span>📊</span> Analytics & Exports
            </div>
            <h1 className="mt-2 font-display text-2xl font-black sm:text-3xl lg:text-4xl">
              Ulat at Reports
            </h1>
            <p className="mt-1 text-xs text-white/80 sm:text-sm">
              I-download ang mga ulat ng kita, billing, occupancy, at utang ng tenants.
            </p>
          </div>

          <button
            onClick={onGenerateAll}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-coral px-5 py-3 font-mono-brand text-xs font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-coral-deep active:translate-y-0"
          >
            <span>📥</span> I-download Lahat (ZIP)
          </button>
        </div>
      </div>

      {/* Quick Financial Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-paper-card p-4 shadow-sm">
          <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            Kabuuan ng Kita ({summary.period})
          </span>
          <div className="mt-1 font-display text-2xl font-bold text-forest">
            ₱{summary.totalRevenue.toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-paper-card p-4 shadow-sm">
          <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            Gastos sa Maintenance
          </span>
          <div className="mt-1 font-display text-2xl font-bold text-coral-deep">
            ₱{summary.totalExpenses.toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-paper-card p-4 shadow-sm">
          <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            Malinis na Kita (Net Income)
          </span>
          <div className="mt-1 font-display text-2xl font-bold text-forest-deep">
            ₱{summary.netIncome.toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-paper-card p-4 shadow-sm">
          <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            Occupancy Rate
          </span>
          <div className="mt-1 font-display text-2xl font-bold text-marigold-deep">
            {summary.occupancyRate}%
          </div>
        </div>
      </div>
    </div>
  );
}