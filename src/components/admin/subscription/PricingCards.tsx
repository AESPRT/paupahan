"use client";

import { useState } from "react";
import { SubscriptionPlan, PlanTier } from "@/src/types/admin/subscription";

interface PricingCardsProps {
  plans: SubscriptionPlan[];
  currentPlanName: PlanTier;
  onSelectPlan: (plan: SubscriptionPlan) => void;
}

/** Single decorative circle on left and right edge of each card — ticket stub style */
function CardDots({ featured, free }: { featured: boolean; free: boolean }) {
  const circleCls = featured
    ? "bg-forest border-white/20"
    : free
      ? "bg-paper border-line"
      : "bg-paper border-line";

  return (
    <>
      {/* Left edge circle */}
      <span
        aria-hidden
        className={`absolute top-[72px] -left-[10px] h-5 w-5 rounded-full border-[1.5px] ${circleCls}`}
      />
      {/* Right edge circle */}
      <span
        aria-hidden
        className={`absolute top-[72px] -right-[10px] h-5 w-5 rounded-full border-[1.5px] ${circleCls}`}
      />
    </>
  );
}

export function PricingCards({
  plans,
  currentPlanName,
  onSelectPlan,
}: PricingCardsProps) {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h2 className="font-mono-brand text-xs font-bold uppercase tracking-wider text-muted">
          Pumili ng Nararapat na Plan
        </h2>
        <p className="mt-1 font-display text-lg font-bold text-forest-deep sm:text-xl">
          Mag-scale ayon sa dami ng iyong paupahan — walang lock-in, pwede mag-upgrade o cancel anumang oras.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {plans.map((plan, i) => {
          const isCurrent = plan.name === currentPlanName;
          // I-hide ang ika-4 na card pataas kapag hindi pa naka-showAll (gagana na sa mobile at desktop)
          const isHidden = !showAll && i >= 3;

          return (
            <div
              key={plan.id}
              className={`relative flex-col rounded-2xl border-[1.5px] p-5 pb-6 sm:p-[22px] sm:pb-6 transition-all hover:shadow-md ${
                isHidden ? "hidden" : "flex"
              } ${
                plan.isPopular
                  ? "border-forest bg-forest text-white shadow-[0_20px_44px_rgba(31,75,63,0.30)] lg:-translate-y-2"
                  : plan.priceMonthly === 0
                  ? "border-dashed border-line bg-paper-card/60 shadow-none"
                  : "border-line bg-paper-card text-ink shadow-[0_8px_24px_rgba(27,58,52,0.08)]"
              }`}
            >
              {/* Decorative ticket stub dots */}
              <CardDots featured={plan.isPopular ?? false} free={plan.priceMonthly === 0} />

              {/* Popular Badge */}
              {plan.isPopular && (
                <span className="absolute -top-0 left-1/2 -translate-x-1/2 rounded-b-full bg-marigold px-3 py-1 font-mono-brand text-[10.5px] font-semibold uppercase tracking-[0.05em] text-forest-deep shadow-sm">
                  Pinakasikat
                </span>
              )}

              {/* Plan Header Info */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`mt-2 font-mono-brand text-[11px] uppercase tracking-[0.09em] ${
                      plan.isPopular
                        ? "text-marigold"
                        : plan.priceMonthly === 0
                        ? "text-muted"
                        : "text-coral-deep"
                    }`}
                  >
                    {plan.maxUnits}
                  </div>
                </div>

                <div
                  className={`mt-1 font-display text-[20px] font-bold leading-tight ${
                    plan.isPopular ? "text-white" : "text-forest-deep"
                  }`}
                >
                  {plan.name}
                </div>

                {/* Price Display */}
                <div className="mt-4 flex items-baseline gap-1 font-mono-brand">
                  <span
                    className={`text-[32px] font-semibold leading-none ${
                      plan.isPopular
                        ? "text-white"
                        : plan.priceMonthly === 0
                        ? "text-forest"
                        : "text-forest-deep"
                    }`}
                  >
                    ₱{plan.priceMonthly.toLocaleString()}
                  </span>
                  <span
                    className={`text-[13px] ${
                      plan.isPopular ? "text-white/60" : "text-muted"
                    }`}
                  >
                    / buwan
                  </span>
                </div>
              </div>

              {/* Features List */}
              <ul
                className={`mt-5 mb-6 flex flex-1 flex-col gap-2.5 border-t-[1.5px] border-dashed pt-4 text-xs ${
                  plan.isPopular ? "border-white/20 text-white/85" : "border-line text-ink"
                }`}
              >
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 leading-snug">
                    <span
                      className={`shrink-0 font-bold ${
                        plan.isPopular ? "text-marigold" : "text-forest"
                      }`}
                    >
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <div>
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
                        ? "!bg-white !text-coral-deep shadow-none hover:bg-white/90"
                        : plan.priceMonthly === 0
                        ? "border border-line bg-paper text-muted hover:bg-forest/[0.04]"
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

      {/* Load More Button (Naaayos na para lumitaw din sa mobile kung may higit sa 3 plans) */}
      {plans.length > 3 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-line bg-paper-card px-6 py-3 font-mono-brand text-[13px] font-semibold text-forest-deep shadow-[0_4px_12px_rgba(27,58,52,0.06)] transition-all hover:-translate-y-0.5 hover:border-forest/30 active:translate-y-0"
          >
            <span>
              {showAll ? "Ipakita ang Mas Kakaunting Plano" : "Ipakita ang Lahat ng Plano (Business & Custom)"}
            </span>
            <svg
              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                showAll ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}