"use client";

interface TenantHistoryHeaderProps {
  totalPaidCount: number;
}

export function TenantHistoryHeader({ totalPaidCount }: TenantHistoryHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-forest/20 bg-gradient-to-r from-forest via-forest-deep to-forest p-6 text-white shadow-sm sm:p-8">
      {/* Decorative Blur Backgrounds */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-marigold/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 right-24 h-36 w-36 rounded-full bg-coral/20 blur-xl" />

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-marigold backdrop-blur-md">
            {/* History / Clock Icon */}
            <svg className="h-3.5 w-3.5 shrink-0 text-marigold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Payment Records</span>
          </div>

          <h1 className="font-display text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
            Kasaysayan ng mga Bayad (History)
          </h1>

          <p className="max-w-xl text-xs font-medium text-white/80 sm:text-sm">
            Tingnan ang lahat ng iyong nakaraang buwanang bayarin na matagumpay nang na-settle.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="shrink-0 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 text-center">
          <p className="text-[10px] uppercase font-mono-brand tracking-wider text-marigold">Kabuuan na Paid</p>
          <p className="font-display text-2xl font-black">{totalPaidCount} Bills</p>
        </div>
      </div>
    </div>
  );
}