"use client";

import { SubscriptionPlan, PlanTier } from "@/src/types/subscription";

interface PricingCardsProps {
  plans: SubscriptionPlan[];
  currentPlanName: PlanTier;
  onSelectPlan: (plan: SubscriptionPlan) => void;
}

export function PricingCards({
  plans,
  currentPlanName,
  onSelectPlan,
}: PricingCardsProps) {
  return (
    <div className="space-y-4">
      <div className="text-center sm:text-left">
        <h2 className="font-mono-brand text-xs font-bold uppercase tracking-wider text-muted">
          Pumili ng Nararapat na Plan
        </h2>
        <p className="mt-1 font-display text-lg font-bold text-forest-deep">
          Mag-scale ayon sa dami ng iyong paupahan
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.name === currentPlanName;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl border bg-paper-card p-6 shadow-sm transition-all hover:shadow-md ${
                plan.isPopular
                  ? "border-coral/50 ring-2 ring-coral/20"
                  : "border-line"
              }`}
            >
              {plan.isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-coral px-3 py-0.5 font-mono-brand text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                  Pinakasikat
                </span>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-forest-deep">
                    {plan.name}
                  </h3>
                  <span className="rounded-md border border-line bg-paper px-2 py-0.5 font-mono-brand text-[10px] font-bold text-muted">
                    {plan.maxUnits}
                  </span>
                </div>

                {/* Price */}
                <div className="mt-4 flex items-baseline gap-1 font-mono-brand">
                  <span className="text-2xl font-black text-forest-deep sm:text-3xl">
                    ₱{plan.priceMonthly.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted">/ buwan</span>
                </div>

                {/* Features List */}
                <ul className="mt-6 space-y-2.5 text-xs text-ink">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-forest font-bold">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-8">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full rounded-xl border border-line bg-paper py-2.5 font-mono-brand text-xs font-bold text-muted cursor-default"
                  >
                    Kasalukuyang Gamit
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectPlan(plan)}
                    className={`w-full rounded-xl py-2.5 font-mono-brand text-xs font-bold transition-all active:scale-95 ${
                      plan.isPopular
                        ? "bg-forest text-white shadow-sm hover:bg-forest-deep"
                        : "border border-line bg-paper text-forest-deep hover:bg-line/40"
                    }`}
                  >
                    Pumili ng {plan.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}