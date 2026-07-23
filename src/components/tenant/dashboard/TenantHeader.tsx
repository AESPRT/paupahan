"use client";

import { TenantDashboardData } from "@/src/types/tenant/tenant-dashboard";

interface TenantHeaderProps {
  data: TenantDashboardData;
}

export function TenantHeader({ data }: TenantHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-forest/20 bg-gradient-to-r from-forest via-forest-deep to-forest p-6 text-white shadow-md sm:p-8">
      {/* Decorative Blur Effect */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          {/* Property Badge with Pin SVG */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-mono-brand text-[11px] font-bold tracking-wide text-white backdrop-blur-md">
            <svg className="h-3.5 w-3.5 shrink-0 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{data.propertyName}</span>
          </div>

          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-black sm:text-3xl">
              Maligayang Pagdating, {data.tenantName}!
            </h1>
            {/* Hand Wave SVG Icon */}
            <svg className="h-6 w-6 text-amber-300 animate-bounce shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
            </svg>
          </div>

          <p className="text-xs text-white/80 sm:text-sm">
            Naka-assign sa <span className="font-bold text-white">{data.roomName}</span>
          </p>
        </div>

        {/* Billing Cycle Box with Calendar SVG */}
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3.5 backdrop-blur-md shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-mono-brand text-[10px] text-white/70 uppercase">Billing Cycle</p>
            <p className="font-mono-brand text-xs font-bold text-white">{data.billingMonth}</p>
          </div>
        </div>
      </div>
    </div>
  );
}