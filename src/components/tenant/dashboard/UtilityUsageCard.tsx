"use client";

import { TenantDashboardData } from "@/src/types/tenant/tenant-dashboard";
import { Zap, Droplets, Activity } from "lucide-react";

interface UtilityUsageCardProps {
  data: TenantDashboardData;
}

export function UtilityUsageCard({ data }: UtilityUsageCardProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-line bg-paper-card p-5 sm:p-6 shadow-sm">
      <div className="border-b border-line pb-3 flex items-center gap-2.5">
        {/* Activity / Utility Header Lucide Icon */}
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest/10 text-forest shrink-0">
          <Activity className="h-5 w-5" />
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
              {/* Zap / Electricity Lucide Icon */}
              <Zap className="h-4 w-4 text-amber-600 shrink-0" />
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
              {/* Droplets / Water Lucide Icon */}
              <Droplets className="h-4 w-4 text-blue-600 shrink-0" />
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