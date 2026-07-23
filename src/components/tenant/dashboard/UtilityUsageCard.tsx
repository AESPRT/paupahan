"use client";

import { TenantDashboardData } from "@/src/types/tenant/tenant-dashboard";

interface UtilityUsageCardProps {
  data: TenantDashboardData;
}

export function UtilityUsageCard({ data }: UtilityUsageCardProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-line bg-paper-card p-5 sm:p-6 shadow-sm">
      <div className="border-b border-line pb-3 flex items-center gap-2.5">
        {/* Lightning / Utility Header SVG Icon */}
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest/10 text-forest shrink-0">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-forest-deep sm:text-lg">
            Consumption & Utility Readings
          </h2>
          <p className="text-[11px] text-muted sm:text-xs">
            Kasalukuyang konsumo sa kuryente at tubig ngayong billing cycle.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Electricity Box */}
        <div className="rounded-2xl border border-amber-200/60 bg-amber-50/40 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {/* Lightbulb / Electricity SVG Icon */}
              <svg className="h-4 w-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="font-display text-xs font-bold text-amber-900">
                Kuryente (Electricity)
              </span>
            </div>
            <span className="font-mono-brand text-xs font-bold text-amber-800">
              ₱{data.electricity.totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-amber-200/50">
            <div>
              <p className="text-[10px] text-muted">Nakaraan</p>
              <p className="font-mono-brand text-xs font-semibold">{data.electricity.previousReading}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted">Kasalukuyan</p>
              <p className="font-mono-brand text-xs font-semibold">{data.electricity.currentReading}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted">Nagamit (kWh)</p>
              <p className="font-mono-brand text-xs font-bold text-amber-700">{data.electricity.kwhUsed} kWh</p>
            </div>
          </div>
        </div>

        {/* Water Box */}
        <div className="rounded-2xl border border-blue-200/60 bg-blue-50/40 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {/* Water Drop SVG Icon */}
              <svg className="h-4 w-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span className="font-display text-xs font-bold text-blue-900">
                Tubig (Water Supply)
              </span>
            </div>
            <span className="font-mono-brand text-xs font-bold text-blue-800">
              ₱{data.water.totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-blue-200/50">
            <div>
              <p className="text-[10px] text-muted">Nakaraan</p>
              <p className="font-mono-brand text-xs font-semibold">{data.water.previousReading}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted">Kasalukuyan</p>
              <p className="font-mono-brand text-xs font-semibold">{data.water.currentReading}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted">Nagamit (m³)</p>
              <p className="font-mono-brand text-xs font-bold text-blue-700">{data.water.cubicUsed} m³</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}