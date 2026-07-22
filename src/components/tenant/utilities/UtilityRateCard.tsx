import { UtilityRate } from "@/src/types/tenant-utilities";

interface UtilityRateCardProps {
  rate: UtilityRate;
}

export function UtilityRateCard({ rate }: UtilityRateCardProps) {
  const isElectricity = rate.type === "electricity";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-paper-card p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-3">
          {/* Icon Container with SVG */}
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
              isElectricity
                ? "bg-amber-100 text-amber-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            {isElectricity ? (
              /* Lightning / Electricity SVG Icon */
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            ) : (
              /* Water Drop SVG Icon */
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            )}
          </div>

          <div>
            <h3 className="font-display text-sm font-bold text-forest-deep">
              {rate.name}
            </h3>
            <p className="font-mono-brand text-[10px] text-muted">
              Huling na-update: {rate.lastUpdated}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="font-display text-3xl font-black text-forest-deep">
          ₱{rate.ratePerUnit.toFixed(2)}
        </span>
        <span className="font-mono-brand text-xs font-bold text-muted">
          / {rate.unit}
        </span>
      </div>

      <p className="text-xs text-muted leading-relaxed">
        {rate.description}
      </p>
    </div>
  );
}