/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, FormEvent } from "react";
import { Button } from "./Button";
import { PLANS } from "@/src/data/subscription";
import { createCheckoutSession, submitCustomInquiry } from "@/src/actions/subscription";

function CardDots({ featured, free }: { featured: boolean; free: boolean }) {
  const circleCls = featured
    ? "bg-forest border-white/20"
    : free
      ? "bg-paper border-line"
      : "bg-paper border-line";

  return (
    <>
      <span aria-hidden className={`absolute top-[72px] -left-[10px] h-5 w-5 rounded-full border-[1.5px] ${circleCls}`} />
      <span aria-hidden className={`absolute top-[72px] -right-[10px] h-5 w-5 rounded-full border-[1.5px] ${circleCls}`} />
    </>
  );
}

export function Pricing() {
  const [showAll, setShowAll] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  
  // Custom Modal State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [customLoading, setCustomLoading] = useState(false);
  const [customSuccess, setCustomSuccess] = useState(false);
  const [customError, setCustomError] = useState("");

  const [billingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  
  // Checkout Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCheckout = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const checkoutUrl = await createCheckoutSession({
        userId: `USR-${Date.now()}`,
        packageId: selectedPlan.name,
        cycle: billingCycle,
        cusName: name,
        cusEmail: email,
        cusPhone: phone,
        successUrl: `${window.location.origin}/admin/register?plan=${selectedPlan.name}`,
        cancelUrl: `${window.location.origin}/#pricing`,
      });

      window.location.href = checkoutUrl;
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
      setCustomError(err.message);
    } finally {
      setCustomLoading(false);
    }
  };

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
            Lahat ng bayad-plano ay walang lock-in, pwede mag-upgrade o cancel anumang oras.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {PLANS.map((plan, i) => {
            const isHidden = !showAll && i >= 3;
            const isFree = plan.priceMonthly === 0 && plan.priceDisplay === "₱0";
            
            const isCustomPlan = 
              plan.name.toLowerCase().includes("custom") || 
              plan.name.toLowerCase().includes("eksklusibo") ||
              plan.displayName.toLowerCase().includes("custom") ||
              plan.displayName.toLowerCase().includes("eksklusibo");

            return (
              <div
                key={plan.name}
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

                <div className={`mt-4 font-mono-brand text-[11px] uppercase tracking-[0.09em] ${plan.isPopular ? "text-marigold" : isFree ? "text-muted" : "text-coral-deep"}`}>
                  {plan.tag}
                </div>
                <div className={`mt-1 font-display text-[20px] font-bold leading-tight ${plan.isPopular ? "text-white" : "text-forest-deep"}`}>
                  {plan.displayName}
                </div>
                <div className={`mt-1 text-[12.5px] leading-snug ${plan.isPopular ? "text-white/65" : "text-muted"}`}>
                  {plan.tagline}
                </div>

                <div className="mt-4 flex items-baseline gap-1 font-mono-brand">
                  <span className={`text-[32px] font-semibold leading-none ${plan.isPopular ? "text-white" : isFree ? "text-forest" : "text-forest-deep"}`}>
                    {plan.priceDisplay}
                  </span>
                  {plan.per && <span className={`text-[13px] ${plan.isPopular ? "text-white/60" : "text-muted"}`}>{plan.per}</span>}
                </div>

                {/* Feature List (kasama na ang included at missing/excluded features) */}
                <ul className={`mt-4 mb-5 flex flex-1 flex-col gap-2.5 border-t-[1.5px] border-dashed pt-4 ${plan.isPopular ? "border-white/20" : "border-line"}`}>
                  {plan.features.map((perk) => (
                    <li key={perk} className={`flex items-start gap-2.5 text-[13px] leading-snug ${plan.isPopular ? "text-white/85" : "text-ink"}`}>
                      <svg className={`mt-0.5 h-4 w-4 shrink-0 ${plan.isPopular ? "text-marigold" : "text-forest"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{perk}</span>
                    </li>
                  ))}
                  {plan.missing && plan.missing.map((miss) => (
                    <li key={miss} className={`flex items-start gap-2.5 text-[13px] leading-snug line-through ${plan.isPopular ? "text-white/40" : "text-muted/60"}`}>
                      <span className={`mt-0.5 shrink-0 ${plan.isPopular ? "text-white/30" : "text-muted/40"}`}>✕</span>
                      <span>{miss}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => {
                    if (isCustomPlan) {
                      setShowCustomModal(true);
                    } else if (isFree) {
                      window.location.href = `/admin/register?plan=${plan.name}`;
                    } else {
                      setSelectedPlan(plan);
                    }
                  }}
                  variant={plan.isPopular ? "primary" : "ghost"}
                  block
                  className={plan.isPopular ? "!bg-white !text-coral-deep !shadow-none" : isFree ? "!border-line !text-muted hover:!bg-forest/[0.04]" : ""}
                >
                  {plan.cta}
                </Button>
              </div>
            );
          })}
        </div>

        {/* SHOW MORE / SHOW LESS BUTTON */}
        {PLANS.length > 3 && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 rounded-xl border-[1.5px] border-line bg-paper-card px-6 py-3 font-mono-brand text-[13px] font-semibold text-forest-deep shadow-[0_4px_12px_rgba(27,58,52,0.06)] hover:bg-forest/[0.04] transition-colors cursor-pointer"
            >
              <span>{showAll ? "Itago ang ibang plano" : `Tingnan ang iba pang plano (${PLANS.length - 3})`}</span>
              <svg className={`h-4 w-4 transition-transform duration-200 ${showAll ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* CHECKOUT MODAL */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-deep/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-[1.5px] border-line bg-paper-card p-6 shadow-[0_24px_60px_rgba(27,58,52,0.25)] sm:p-8">
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-marigold/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-coral-deep/15 blur-2xl pointer-events-none" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-forest/20 bg-forest/[0.08] px-3 py-1 font-mono-brand text-[11px] font-semibold uppercase tracking-[0.08em] text-forest">
                  ✨ Kaunting hakbang na lang
                </span>
                <button 
                  type="button" 
                  onClick={() => setSelectedPlan(null)}
                  className="rounded-full p-1.5 text-muted hover:bg-line/40 hover:text-forest-deep transition-colors cursor-pointer"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <h3 className="mt-3 font-display text-[22px] font-bold text-forest-deep">
                Handa na para sa <span className="text-coral-deep">{selectedPlan.displayName}</span>!
              </h3>
              <p className="mt-1 text-[13.5px] text-muted leading-relaxed">
                I-fill up ang iyong mga detalye para diretsong makapunta sa secure checkout ng PayMongo.
              </p>

              <form onSubmit={handleCheckout} className="mt-6 space-y-4">
                <div>
                  <label className="block font-mono-brand text-[11.5px] font-semibold uppercase tracking-[0.05em] text-forest-deep mb-1">
                    Buong Pangalan
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full rounded-xl border-[1.5px] border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-forest focus:outline-none transition-colors" 
                    placeholder="Juan Dela Cruz" 
                  />
                </div>

                <div>
                  <label className="block font-mono-brand text-[11.5px] font-semibold uppercase tracking-[0.05em] text-forest-deep mb-1">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full rounded-xl border-[1.5px] border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-forest focus:outline-none transition-colors" 
                    placeholder="juan@example.com" 
                  />
                </div>

                <div>
                  <label className="block font-mono-brand text-[11.5px] font-semibold uppercase tracking-[0.05em] text-forest-deep mb-1">
                    Numero ng Telepono <span className="text-xs font-normal text-muted">(GCash/Maya)</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    className="w-full rounded-xl border-[1.5px] border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-forest focus:outline-none transition-colors" 
                    placeholder="09123456789" 
                  />
                </div>

                {errorMsg && (
                  <div className="rounded-xl border border-coral-deep/30 bg-coral-deep/[0.08] p-3 text-xs text-coral-deep">
                    {errorMsg}
                  </div>
                )}

                <div className="mt-6 flex items-center gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setSelectedPlan(null)} 
                    className="flex-1 rounded-xl border-[1.5px] border-line py-3 text-sm font-semibold text-muted hover:bg-line/30 hover:text-forest-deep transition-all cursor-pointer"
                  >
                    Kanselahin
                  </button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={loading}
                    className="flex-1 !py-3 !rounded-xl !shadow-md flex items-center justify-center gap-2"
                  >
                    <span>{loading ? "Inihahanda..." : "Magbayad Na"}</span>
                    {!loading && (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
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
                  <Button
                    onClick={() => {
                      setShowCustomModal(false);
                      setCustomSuccess(false);
                      setCustomName("");
                      setCustomEmail("");
                      setCustomMessage("");
                    }}
                    variant="primary"
                    className="mt-4 !py-2.5 !rounded-xl"
                  >
                    Isara
                  </Button>
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
                      <Button 
                        type="submit" 
                        variant="primary" 
                        disabled={customLoading}
                        className="flex-1 !py-3 !rounded-xl !shadow-md flex items-center justify-center gap-2"
                      >
                        <span>{customLoading ? "Ipinapadala..." : "I-send ang Email"}</span>
                        {!customLoading && (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}