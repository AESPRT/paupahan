"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Kailangan ko ba ng credit card para mag-trial?",
    a: "Hindi. Puwede kang gumamit ng Paupahan nang 14 na araw nang libre, walang kinakailangang credit card. Piliin mo lang ang plano kapag handa ka nang magbayad.",
  },
  {
    q: "Pwede ba akong lumipat ng plano anumang oras?",
    a: "Oo. Pwede kang mag-upgrade o mag-downgrade anumang oras sa loob ng account settings mo — awtomatikong mai-adjust ang susunod mong bill.",
  },
  {
    q: "Paano kung mahigit sa unit limit ko?",
    a: "Sasabihan ka namin bago ka maabot ang limit ng plano mo, at pwede kang mag-upgrade agad para hindi maantala ang billing ng ibang unit mo.",
  },
  {
    q: "May online payment ba para sa mga tenant?",
    a: "Available ang online payments (GCash, card, bank transfer) bilang add-on. Sa ngayon, kaya mo ring i-record nang manu-mano ang mga bayad na cash o bank transfer.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-13 sm:py-16 lg:py-[84px]" id="faq">
      <div className="mx-auto max-w-[1140px] px-4.5 sm:px-6">
        <div className="mx-auto mb-8 max-w-[600px] text-center sm:mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-coral-deep/25 bg-coral-deep/[0.09] px-3 py-1.5 font-mono-brand text-[12.5px] font-semibold uppercase tracking-[0.08em] text-coral-deep">
            Mga tanong
          </span>
          <h2 className="mt-3.5 font-display text-[28px] font-bold text-forest-deep sm:text-[34px] lg:text-[38px]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mx-auto flex max-w-[760px] flex-col gap-3.5">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.q} className="overflow-hidden rounded-[14px] border border-line bg-paper-card">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4.5 text-left text-[14.5px] font-bold text-forest-deep sm:px-5.5 sm:py-5 sm:text-[15.5px] focus-visible:outline focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-marigold-deep"
                >
                  {item.q}
                  <span className={`ml-3.5 shrink-0 font-mono-brand text-lg text-coral transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}>
                    +
                  </span>
                </button>
                <div className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4.5 text-[14px] leading-relaxed text-muted sm:px-5.5 sm:pb-5 sm:text-[14.5px]">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
