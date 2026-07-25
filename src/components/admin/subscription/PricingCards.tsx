/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, SubmitEvent } from "react";
import { SubscriptionPlan, PlanTier } from "@/src/types/admin/subscription";
import { changeLandlordSubscription, submitCustomInquiry } from "@/src/actions/subscription";

interface PricingCardsProps {
  plans: SubscriptionPlan[];
  currentPlanName: PlanTier;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  userId?: string;
  billingCycle?: "MONTHLY" | "ANNUAL";
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
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
  userId,
  billingCycle = "MONTHLY",
  customerInfo,
}: PricingCardsProps) {
  const [showAll, setShowAll] = useState(false);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Custom Modal State para sa Eksklusibo / Custom Plan
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState(customerInfo?.name || "");
  const [customEmail, setCustomEmail] = useState(customerInfo?.email || "");
  const [customMessage, setCustomMessage] = useState("");
  const [customLoading, setCustomLoading] = useState(false);
  const [customSuccess, setCustomSuccess] = useState(false);
  const [customError, setCustomError] = useState("");

  const handlePlanSelection = async (plan: SubscriptionPlan) => {
    setErrorMsg(null);

    if (!userId) {
      setErrorMsg("Kailangan ang userId. Mangyaring mag-log in muli.");
      console.error("Subscription Error: Kailangan ang userId.");
      return;
    }

    const isCustomPlan = 
      plan.name.toLowerCase().includes("custom") || 
      plan.name.toLowerCase().includes("eksklusibo") ||
      plan.displayName.toLowerCase().includes("custom") ||
      plan.displayName.toLowerCase().includes("eksklusibo");

    if (isCustomPlan) {
      setShowCustomModal(true);
      return;
    }

    setLoadingPlanId(plan.id || plan.name);

    try {
      const baseUrl = typeof window !== "undefined" ? window.location.href.split("?")[0] : "";
      const successUrl = `${baseUrl}?success=true&planName=${encodeURIComponent(plan.displayName)}`;
      const cancelUrl = baseUrl;

      const response: any = await changeLandlordSubscription({
        userId: userId,
        planId: plan.name, 
        cycle: billingCycle,
        cusName: customerInfo?.name || "",
        cusEmail: customerInfo?.email || "",
        cusPhone: customerInfo?.phone || "",
        successUrl: successUrl,
        cancelUrl: cancelUrl,
      });

      const checkoutUrl = typeof response === 'string' ? response : response?.checkoutUrl || response?.url;

      if (checkoutUrl) {
        window.location.assign(checkoutUrl);
        return;
      }

      if (response?.success || plan.priceMonthly === 0) {
        onSelectPlan(plan);
        setLoadingPlanId(null);
        return;
      }

      throw new Error("Hindi nakuha ang PayMongo checkout URL.");

    } catch (err: any) {
      console.error("Subscription Error:", err);
      setErrorMsg(err.message || "May nangyaring error sa pagpapalit ng plano.");
      setLoadingPlanId(null);
    }
  };

  const handleCustomSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCustomLoading(true);
    setCustomError("");

    try {
      await submitCustomInquiry({
        name: customName,
        email: customEmail,
        message: customMessage,
        planType: "Eksklusibo / Custom",
      });

      setCustomSuccess(true);
    } catch (err: any) {
      setCustomError(err.message || "May nangyaring error sa pagpapadala.");
    } finally {
      setCustomLoading(false);
    }
  };

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

      {errorMsg && (
        <div className="rounded-xl border border-coral-deep/30 bg-coral-deep/[0.08] p-3 text-xs text-coral-deep font-mono-brand">
          {errorMsg}
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {plans.map((plan, i) => {
          const isHidden = !showAll && i >= 3;
          const isFree = plan.priceMonthly === 0 && plan.priceDisplay === "₱0";
          const isLoading = loadingPlanId === (plan.id || plan.name);
          
          // 👈 Naayos na pagsusuri para sa Kasalukuyang Plan
          const currentStr = String(currentPlanName || "").toLowerCase();
          const isCurrent = 
            plan.name.toLowerCase() === currentStr || 
            plan.displayName.toLowerCase() === currentStr || 
            plan.tag.toLowerCase() === currentStr ||
            (currentStr === "maalam" && plan.name === "maalam") ||
            (currentStr === "pasilidad" && plan.name === "maalam") ||
            (currentStr === "negosyante" && plan.name === "negosyante") ||
            (currentStr === "kompleto" && plan.name === "negosyante") ||
            (currentStr === "panimula" && plan.name === "panimula") ||
            (currentStr === "silong" && plan.name === "panimula");

          return (
            <div
              key={plan.id || plan.name}
              className={`relative flex flex-col rounded-2xl border-[1.5px] p-5 pb-6 sm:p-[22px] sm:pb-6 ${
                isHidden ? "hidden" : "flex"
              } ${
                plan.isPopular
                  ? "border-forest bg-forest text-white shadow-[0_20px_44px_rgba(31,75,63,0.30)] lg:-translate-y-2"
                  : isFree
                  ? "border-dashed border-line bg-paper-card/60 shadow-none"
                  : "border-line bg-paper-card shadow-[0_8px_24px_rgba(27,58,52,0.08)]"
              }`}
            >
              <CardDots featured={plan.isPopular ?? false} free={isFree} />

              {plan.badge && (
                <span className="absolute -top-0 left-1/2 -translate-x-1/2 rounded-b-full bg-marigold px-3 py-1 font-mono-brand text-[10.5px] font-semibold uppercase tracking-[0.05em] text-forest-deep shadow-sm">
                  {plan.badge}
                </span>
              )}

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
                    className={`flex gap-2 text-[13px] leading-snug line-through ${
                      plan.isPopular ? "text-white/40" : "text-muted/60"
                    }`}
                  >
                    <span className={`shrink-0 ${plan.isPopular ? "text-white/30" : "text-muted/40"}`}>✕</span>
                    {miss}
                  </li>
                ))}
              </ul>

              <div>
                {isCurrent ? (
                  <button
                    disabled
                    className={`w-full rounded-xl py-2.5 font-mono-brand text-xs font-bold cursor-default transition-all ${
                      plan.isPopular
                        ? "border border-white/30 bg-white/20 text-white shadow-none"
                        : "border border-line bg-paper text-muted shadow-none"
                    }`}
                  >
                    Kasalukuyang Gamit
                  </button>
                ) : (
                  <button
                    onClick={() => handlePlanSelection(plan)}
                    disabled={isLoading}
                    className={`w-full rounded-xl py-2.5 font-mono-brand text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${
                      plan.isPopular
                        ? "!bg-white !text-coral-deep !shadow-none hover:bg-white/90"
                        : isFree
                        ? "border border-line bg-paper text-muted hover:bg-forest/[0.04]"
                        : "border border-line bg-paper text-forest-deep hover:bg-line/40"
                    }`}
                  >
                    {isLoading ? "Ina-update..." : plan.cta}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {plans.length > 3 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-card px-5 sm:px-6 py-3 font-mono-brand text-xs sm:text-[13px] font-semibold text-forest-deep shadow-[0_4px_12px_rgba(27,58,52,0.06)] transition-all hover:-translate-y-0.5 hover:border-forest/30 active:translate-y-0 cursor-pointer"
          >
            <span>
              {showAll ? "Ipakita ang Mas Kakaunting Plano" : "Ipakita ang Iba Pang Plano (Business & Custom)"}
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

      {/* CUSTOM / EKSKLUSIBO INQUIRY MODAL */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-deep/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-[1.5px] border-line bg-paper-card p-6 shadow-[0_24px_60px_rgba(27,58,52,0.25)] sm:p-8">
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-forest/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-marigold/15 blur-2xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-forest/20 bg-forest/[0.08] px-3 py-1 font-mono-brand text-[11px] font-semibold uppercase tracking-[0.08em] text-forest">
                  ✉️ Eksklusibong Solusyon
                </span>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowCustomModal(false);
                    setCustomSuccess(false);
                  }}
                  className="rounded-full p-1.5 text-muted hover:bg-line/40 hover:text-forest-deep transition-colors cursor-pointer"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {customSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-forest/10 text-forest">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-display text-[22px] font-bold text-forest-deep">
                    Naipadala na ang iyong mensahe!
                  </h3>
                  <p className="text-[13.5px] text-muted leading-relaxed">
                    Maraming salamat! Makikipag-ugnayan kami sa iyo sa lalong madaling panahon para sa iyong custom requirements.
                  </p>
                  <button
                    onClick={() => {
                      setShowCustomModal(false);
                      setCustomSuccess(false);
                      setCustomMessage("");
                    }}
                    className="w-full mt-4 rounded-xl border border-line bg-forest py-2.5 text-sm font-semibold text-white shadow-md hover:bg-forest/90 transition-all cursor-pointer"
                  >
                    Isara
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="mt-3 font-display text-[22px] font-bold text-forest-deep">
                    Makipag-ugnayan para sa <span className="text-forest">Custom Plan</span>
                  </h3>
                  <p className="mt-1 text-[13.5px] text-muted leading-relaxed">
                    I-fill up ang form na ito at direktang mapupunta sa aming team ang iyong mga kailangan at detalye.
                  </p>

                  <form onSubmit={handleCustomSubmit} className="mt-6 space-y-4">
                    <div>
                      <label className="block font-mono-brand text-[11.5px] font-semibold uppercase tracking-[0.05em] text-forest-deep mb-1">
                        Buong Pangalan / Kumpanya
                      </label>
                      <input 
                        type="text" 
                        required 
                        value={customName} 
                        onChange={e => setCustomName(e.target.value)} 
                        className="w-full rounded-xl border-[1.5px] border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-forest focus:outline-none transition-colors" 
                        placeholder="Juan Dela Cruz / Property Management Inc." 
                      />
                    </div>

                    <div>
                      <label className="block font-mono-brand text-[11.5px] font-semibold uppercase tracking-[0.05em] text-forest-deep mb-1">
                        Email Address
                      </label>
                      <input 
                        type="email" 
                        required 
                        value={customEmail} 
                        onChange={e => setCustomEmail(e.target.value)} 
                        className="w-full rounded-xl border-[1.5px] border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-forest focus:outline-none transition-colors" 
                        placeholder="juan@example.com" 
                      />
                    </div>

                    <div>
                      <label className="block font-mono-brand text-[11.5px] font-semibold uppercase tracking-[0.05em] text-forest-deep mb-1">
                        Anong mga features o kailangan mo?
                      </label>
                      <textarea 
                        required 
                        rows={3}
                        value={customMessage} 
                        onChange={e => setCustomMessage(e.target.value)} 
                        className="w-full rounded-xl border-[1.5px] border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-forest focus:outline-none transition-colors resize-none" 
                        placeholder="Ilarawan ang lawak ng iyong mga property o espesyal na pangangailangan..." 
                      />
                    </div>

                    {customError && (
                      <div className="rounded-xl border border-coral-deep/30 bg-coral-deep/[0.08] p-3 text-xs text-coral-deep">
                        {customError}
                      </div>
                    )}

                    <div className="mt-6 flex items-center gap-3 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setShowCustomModal(false)} 
                        className="flex-1 rounded-xl border-[1.5px] border-line py-3 text-sm font-semibold text-muted hover:bg-line/30 hover:text-forest-deep transition-all cursor-pointer"
                      >
                        Kanselahin
                      </button>
                      <button 
                        type="submit" 
                        disabled={customLoading}
                        className="flex-1 rounded-xl bg-forest py-3 text-sm font-semibold text-white shadow-md hover:bg-forest/90 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <span>{customLoading ? "Ipinapadala..." : "I-send ang Email"}</span>
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}