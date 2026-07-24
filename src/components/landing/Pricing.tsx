"use client";

import { useState } from "react";
import { Button } from "./Button";
import { PLANS } from "@/src/data/subscription";

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

export function Pricing() {
  const [showAll, setShowAll] = useState(false);

  return (
    <section className="py-13 sm:py-16 lg:py-[84px]" id="pricing">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mx-auto mb-8 max-w-[600px] text-center sm:mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-coral-deep/25 bg-coral-deep/[0.09] px-3 py-1.5 font-mono-brand text-[12.5px] font-semibold uppercase tracking-[0.08em] text-coral-deep">
            Presyo
          </span>
          <h2 className="mt-3.5 font-display text-[28px] font-bold text-forest-deep sm:text-[34px] lg:text-[38px]">
            Pumili ng plano na bagay sa&apos;yo
          </h2>
          <p className="mt-3.5 text-[15.5px] leading-relaxed text-muted">
            Lahat ng bayad-plano ay buwanan — walang lock-in, pwede mag-upgrade o cancel anumang oras.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {PLANS.map((plan, i) => {
            // Hide 4th & 5th cards on desktop (lg:) unless showAll is true
            const isHiddenOnDesktop = !showAll && i >= 3;
            const isFree = plan.priceMonthly === 0 && plan.priceDisplay === "₱0";

            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border-[1.5px] p-5 pb-6 sm:p-[22px] sm:pb-6 ${
                  isHiddenOnDesktop ? "hidden lg:hidden" : "flex"
                } ${
                  plan.isPopular
                    ? "border-forest bg-forest text-white shadow-[0_20px_44px_rgba(31,75,63,0.30)] lg:-translate-y-2"
                    : isFree
                    ? "border-dashed border-line bg-paper-card/60 shadow-none"
                    : "border-line bg-paper-card shadow-[0_8px_24px_rgba(27,58,52,0.08)]"
                }`}
              >
                {/* Decorative dots */}
                <CardDots featured={plan.isPopular ?? false} free={isFree} />

                {/* Badge */}
                {plan.badge && (
                  <span className="absolute -top-0 left-1/2 -translate-x-1/2 rounded-b-full bg-marigold px-3 py-1 font-mono-brand text-[10.5px] font-semibold uppercase tracking-[0.05em] text-forest-deep shadow-sm">
                    {plan.badge}
                  </span>
                )}

                {/* Tag + Name */}
                <div
                  className={`mt-4 font-mono-brand text-[11px] uppercase tracking-[0.09em] ${
                    plan.isPopular
                      ? "text-marigold"
                      : isFree
                      ? "text-muted"
                      : "text-coral-deep"
                  }`}
                >
                  {plan.tag}
                </div>
                <div
                  className={`mt-1 font-display text-[20px] font-bold leading-tight ${
                    plan.isPopular ? "text-white" : "text-forest-deep"
                  }`}
                >
                  {plan.displayName}
                </div>
                <div
                  className={`mt-1 text-[12.5px] leading-snug ${
                    plan.isPopular ? "text-white/65" : "text-muted"
                  }`}
                >
                  {plan.tagline}
                </div>

                {/* Price */}
                <div className="mt-4 flex items-baseline gap-1 font-mono-brand">
                  <span
                    className={`text-[32px] font-semibold leading-none ${
                      plan.isPopular
                        ? "text-white"
                        : isFree
                        ? "text-forest"
                        : "text-forest-deep"
                    }`}
                  >
                    {plan.priceDisplay}
                  </span>
                  {plan.per && (
                    <span
                      className={`text-[13px] ${
                        plan.isPopular ? "text-white/60" : "text-muted"
                      }`}
                    >
                      {plan.per}
                    </span>
                  )}
                </div>
                <div
                  className={`mt-1.5 text-[12px] font-semibold ${
                    plan.isPopular
                      ? "text-marigold/90"
                      : isFree
                      ? "text-muted"
                      : "text-coral-deep"
                  }`}
                >
                  {plan.note}
                </div>

                {/* Feature list */}
                <ul
                  className={`mt-4 mb-5 flex flex-1 flex-col gap-2 border-t-[1.5px] border-dashed pt-4 ${
                    plan.isPopular ? "border-white/20" : "border-line"
                  }`}
                >
                  {plan.features.map((perk) => (
                    <li
                      key={perk}
                      className={`flex gap-2 text-[13px] leading-snug ${
                        plan.isPopular ? "text-white/85" : "text-ink"
                      }`}
                    >
                      <span
                        className={`shrink-0 font-bold ${
                          plan.isPopular ? "text-marigold" : "text-forest"
                        }`}
                      >
                        ✓
                      </span>
                      {perk}
                    </li>
                  ))}
                  {plan.missing && plan.missing.map((miss) => (
                    <li
                      key={miss}
                      className="flex gap-2 text-[13px] leading-snug text-muted/60 line-through"
                    >
                      <span className="shrink-0 text-muted/40">✕</span>
                      {miss}
                    </li>
                  ))}
                </ul>

                <Button
                  href="/admin/register"
                  variant={plan.isPopular ? "primary" : "ghost"}
                  block
                  className={
                    plan.isPopular
                      ? "!bg-white !text-coral-deep !shadow-none"
                      : isFree
                      ? "!border-line !text-muted hover:!bg-forest/[0.04]"
                      : ""
                  }
                >
                  {plan.cta}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Load More Button (Desktop Only) */}
        <div className="mt-8 hidden justify-center lg:flex">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-card px-6 py-3 font-mono-brand text-[13px] font-semibold text-forest-deep shadow-[0_4px_12px_rgba(27,58,52,0.06)] transition-all hover:-translate-y-0.5 hover:border-forest/30 active:translate-y-0"
          >
            <span>
              {showAll ? "Ipakita ang Mas Kakaunting Plano" : "Ipakita ang Iba Pang Plano (Business & Custom)"}
            </span>
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${
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

        <p className="mt-8 text-center text-[13px] text-muted">
          Pwede mag-cancel anumang oras.
        </p>
      </div>
    </section>
  );
}