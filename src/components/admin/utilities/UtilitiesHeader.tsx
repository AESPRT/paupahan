"use client";

import { UtilityRate } from "@/src/types/admin/utility";

interface UtilitiesHeaderProps {
  rates: UtilityRate[];
  onUpdateRate: (id: string, newRate: number) => void;
  onOpenRateModal: () => void; // Pinalitan ang pangalan para mas akma sa pag-set ng rates
}

export function UtilitiesHeader({
  rates,
  onUpdateRate,
  onOpenRateModal,
}: UtilitiesHeaderProps) {
  const getIcon = (type: UtilityRate["type"]) => {
    switch (type) {
      case "electricity":
        return (
          <svg className="h-5 w-5 text-marigold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "water":
        return (
          <svg className="h-5 w-5 text-sky-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case "internet":
        return (
          <svg className="h-5 w-5 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        );
      case "amenities":
        return (
          <svg className="h-5 w-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-forest/20 bg-gradient-to-r from-forest via-forest-deep to-forest p-6 text-white shadow-md sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-marigold/20 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-marigold backdrop-blur-md">
              <svg className="h-3.5 w-3.5 shrink-0 text-marigold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Utility Rates Configuration</span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-black sm:text-3xl lg:text-4xl">
              Utilities at Kuryente/Tubig
            </h1>
            <p className="mt-1 text-xs text-white/80 sm:text-sm">
              I-set at i-update ang standard rates bawat unit para sa kuryente, tubig, internet, at amenities.
            </p>
          </div>

          {/* Button Container */}
          <div className="flex w-full sm:w-auto sm:justify-end">
            <button
              onClick={onOpenRateModal}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-coral px-5 py-3 font-mono-brand text-xs font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-coral-deep active:translate-y-0 sm:w-auto"
            >
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>I-set ang Rates ng Utility</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Rates Quick Config */}
      <div>
        <h2 className="font-mono-brand text-xs font-bold uppercase tracking-wider text-muted mb-3">
          Kasalukuyang Utility Rates (Per Unit / Fixed)
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {rates.map((rate) => (
            <div
              key={rate.id}
              className="flex items-center justify-between rounded-2xl border border-line bg-paper-card p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest/5 border border-forest/10">
                  {getIcon(rate.type)}
                </div>
                <div>
                  <h3 className="font-bold text-forest-deep text-xs sm:text-sm">
                    {rate.name}
                  </h3>
                  <p className="text-[10px] text-muted font-mono-brand">
                    per {rate.unitLabel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 font-mono-brand font-bold text-forest-deep text-sm">
                <span>₱</span>
                <input
                  type="number"
                  value={rate.ratePerUnit}
                  onChange={(e) => onUpdateRate(rate.id, Number(e.target.value))}
                  className="w-16 rounded-lg border border-line bg-paper px-2 py-1 text-right text-xs font-bold outline-none focus:border-forest"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}