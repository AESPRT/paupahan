"use client";

import { UtilityRate } from "@/src/types/admin/utility";

interface UtilityRatesListProps {
  rates: UtilityRate[];
  onEditRate: (rate: UtilityRate) => void;
}

export function UtilityBillsList({ rates, onEditRate }: UtilityRatesListProps) {
  const getIcon = (type: UtilityRate["type"]) => {
    switch (type) {
      case "electricity":
        return (
          <svg className="h-4 w-4 text-marigold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "water":
        return (
          <svg className="h-4 w-4 text-sky-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Salain para tanging Kuryente at Tubig lang ang lumabas dito
  const filteredRates = rates.filter(r => r.type === "electricity" || r.type === "water");

  return (
    <div className="space-y-4">
      <h2 className="font-mono-brand text-xs font-bold uppercase tracking-wider text-muted">
        Mga Rate ng Submeter Utility (Kuryente at Tubig)
      </h2>

      {filteredRates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-paper-card py-12 px-4 text-center shadow-sm">
          <h3 className="font-bold text-forest-deep text-sm mb-1">Walang Utility Rates</h3>
          <p className="text-xs text-muted max-w-sm">Wala pang nakatakdang rate para sa kuryente o tubig.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredRates.map((rate) => (
              <div key={rate.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-paper-card p-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-line/60 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forest/5 border border-forest/10">
                      {getIcon(rate.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-forest-deep text-xs">{rate.name}</h3>
                      <p className="text-[10px] text-muted">Base: {rate.unitLabel}</p>
                    </div>
                  </div>
                  <span className="font-bold text-forest-deep text-sm">
                    ₱{rate.ratePerUnit.toLocaleString()} <span className="text-[10px] text-muted font-normal">/ {rate.unitLabel}</span>
                  </span>
                </div>
                <button
                  onClick={() => onEditRate(rate)}
                  className="w-full rounded-xl bg-forest/10 border border-forest/20 py-2 font-mono-brand text-xs font-bold text-forest hover:bg-forest hover:text-white transition-all"
                >
                  I-update ang Rate
                </button>
              </div>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-line bg-paper-card shadow-sm md:block">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-paper font-mono-brand uppercase text-muted">
                <tr>
                  <th className="px-5 py-4 font-bold">Uri ng Utility</th>
                  <th className="px-5 py-4 font-bold">Base Unit</th>
                  <th className="px-5 py-4 font-bold">Rate / Halaga</th>
                  <th className="px-5 py-4 text-right font-bold">Aksyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {filteredRates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-paper/60 transition-colors">
                    <td className="px-5 py-4 font-semibold text-ink">
                      <div className="inline-flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-forest/5 border border-forest/10">
                          {getIcon(rate.type)}
                        </div>
                        <span className="font-bold text-forest-deep">{rate.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted font-medium">{rate.unitLabel}</td>
                    <td className="px-5 py-4 font-bold text-forest-deep">
                      ₱{rate.ratePerUnit.toLocaleString()} <span className="text-[11px] text-muted font-normal">per {rate.unitLabel}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => onEditRate(rate)}
                        className="rounded-lg border border-forest/30 bg-forest/5 px-3 py-1.5 font-mono-brand text-[11px] font-bold text-forest hover:bg-forest hover:text-white transition-colors"
                      >
                        I-edit ang Rate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}