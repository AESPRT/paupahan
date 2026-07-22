import { Button } from "./Button";

const PLANS = [
  {
    tag: "Libre",
    name: "Panimula",
    tagline: "Para sa gustong subukan muna",
    price: "₱0",
    per: "/buwan",
    note: "Libre habambuhay, walang credit card",
    perks: [
      "Hanggang 2 units na may 3-5 rooms bawat unit",
      "Pwedeng mag rehistro ng tenant",
      "Manual na record ng bayad",
      "Email notifications",
    ],
    missing: [
      "Auto-billing",
      "SMS reminders",
      "Analytics dashboard",
    ],
    featured: false,
    free: true,
    badge: null,
    cta: "Magsimula nang Libre",
    ctaVariant: "ghost" as const,
  },
  {
    tag: "Basic",
    name: "Bahay-Upa",
    tagline: "Para sa baguhang may-ari",
    price: "₱199",
    per: "/buwan",
    note: "Perpekto para sa 1–5 units na",
    perks: [
      "Hanggang 5 units na may 5-10 rooms bawat unit",
      "Auto-billing bawat buwan",
      "Email at SMS reminders",
      "Basic analytics dashboard",
    ],
    missing: [],
    featured: false,
    free: false,
    badge: null,
    cta: "Piliin ang Bahay-Upa",
    ctaVariant: "ghost" as const,
  },
  {
    tag: "Premium",
    name: "Maalam",
    tagline: "Para sa lumalago na negosyo",
    price: "₱399",
    per: "/buwan",
    note: "Pinakasikat sa mga aktibong may-ari",
    perks: [
      "Hanggang 20 units na may 10-15 rooms bawat unit",
      "Auto-billing at reminders",
      "Email, SMS, at in-app notifications",
      "Full analytics + revenue trends",
      "Booking requests module",
    ],
    missing: [],
    featured: true,
    free: false,
    badge: "Pinaka-sikat",
    cta: "Piliin ang Maalam",
    ctaVariant: "primary" as const,
  },
  {
    tag: "Business",
    name: "Negosyante",
    tagline: "Para sa malaking portfolio",
    price: "₱799",
    per: "/buwan",
    note: "Para sa 50+ units na portfolio",
    perks: [
      "Hanggang 50 units na may 15-20 rooms bawat unit",
      "Lahat ng nasa Maalam",
      "Maintenance request tracking",
      "Booking + turnover management",
      "Priority support",
    ],
    missing: [],
    featured: false,
    free: false,
    badge: null,
    cta: "Piliin ang Negosyante",
    ctaVariant: "ghost" as const,
  },
  {
    tag: "Custom",
    name: "Ayon sa'yo",
    tagline: "Para sa enterprise at developer",
    price: "Custom",
    per: "",
    note: "Unlimited — sariling setup ang tawag",
    perks: [
      "Unlimited units",
      "Lahat ng nasa Negosyante",
      "Custom integrations at API access",
      "Dedicated account manager",
      "SLA at advanced security",
    ],
    missing: [],
    featured: false,
    free: false,
    badge: null,
    cta: "Makipag-usap sa Amin",
    ctaVariant: "ghost" as const,
  },
];

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

        {/* Cards grid: 1→2→3→5 cols */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-5 xl:grid-cols-5 xl:gap-4">
          {PLANS.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border-[1.5px] p-5 pb-6 sm:p-[22px] sm:pb-6 xl:p-5 xl:pb-6 ${plan.featured
                  ? "border-forest bg-forest text-white shadow-[0_20px_44px_rgba(31,75,63,0.30)] sm:col-span-2 lg:col-span-1 lg:-translate-y-2"
                  : plan.free
                    ? "border-dashed border-line bg-paper-card/60 shadow-none"
                    : "border-line bg-paper-card shadow-[0_8px_24px_rgba(27,58,52,0.08)]"
                } ${i === 3 ? "lg:col-start-2 xl:col-start-auto" : ""}`}
            >
              {/* Decorative dots */}
              <CardDots featured={plan.featured} free={plan.free} />

              {/* Badge */}
              {plan.badge && (
                <span className="absolute -top-0 left-1/2 -translate-x-1/2 rounded-b-full bg-marigold px-3 py-1 font-mono-brand text-[10.5px] font-semibold uppercase tracking-[0.05em] text-forest-deep">
                  {plan.badge}
                </span>
              )}

              {/* Tag + Name */}
              <div className={`mt-4 font-mono-brand text-[11px] uppercase tracking-[0.09em] ${plan.featured ? "text-marigold" : plan.free ? "text-muted" : "text-coral-deep"}`}>
                {plan.tag}
              </div>
              <div className={`mt-1 font-display text-[20px] font-bold leading-tight ${plan.featured ? "text-white" : "text-forest-deep"}`}>
                {plan.name}
              </div>
              <div className={`mt-1 text-[12.5px] leading-snug ${plan.featured ? "text-white/65" : "text-muted"}`}>
                {plan.tagline}
              </div>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-1 font-mono-brand">
                <span className={`text-[32px] font-semibold leading-none ${plan.featured ? "text-white" : plan.free ? "text-forest" : "text-forest-deep"}`}>
                  {plan.price}
                </span>
                {plan.per && (
                  <span className={`text-[13px] ${plan.featured ? "text-white/60" : "text-muted"}`}>
                    {plan.per}
                  </span>
                )}
              </div>
              <div className={`mt-1.5 text-[12px] font-semibold ${plan.featured ? "text-marigold/90" : plan.free ? "text-muted" : "text-coral-deep"}`}>
                {plan.note}
              </div>

              {/* Feature list */}
              <ul className={`mt-4 mb-5 flex flex-1 flex-col gap-2 border-t-[1.5px] border-dashed pt-4 ${plan.featured ? "border-white/20" : "border-line"}`}>
                {plan.perks.map((perk) => (
                  <li key={perk} className={`flex gap-2 text-[13px] leading-snug ${plan.featured ? "text-white/85" : "text-ink"}`}>
                    <span className={`shrink-0 font-bold ${plan.featured ? "text-marigold" : "text-forest"}`}>✓</span>
                    {perk}
                  </li>
                ))}
                {plan.missing.map((miss) => (
                  <li key={miss} className="flex gap-2 text-[13px] leading-snug text-muted/60 line-through">
                    <span className="shrink-0 text-muted/40">✕</span>
                    {miss}
                  </li>
                ))}
              </ul>

              <Button
                href={plan.free ? "/admin-register" : "/admin-register"}
                variant={plan.featured ? "primary" : "ghost"}
                block
                className={
                  plan.featured
                    ? "!bg-white !text-coral-deep !shadow-none"
                    : plan.free
                      ? "!border-line !text-muted hover:!bg-forest/[0.04]"
                      : ""
                }
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-[13px] text-muted">
          Lahat ng bayad-plano may <strong>14-day free trial</strong>. Pwede mag-cancel anumang oras.
        </p>
      </div>
    </section>
  );
}
