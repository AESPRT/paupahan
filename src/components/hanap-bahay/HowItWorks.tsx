// src/components/hanap-bahay/HowItWorks.tsx
export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Mag-hanap ng Lokasyon",
      description: "I-filter ang mga available na apartment, condo, o kwarto batay sa gusto mong komunidad at budget.",
    },
    {
      step: "02",
      title: "Direktang Makipag-ugnayan",
      description: "Kumonekta agad sa mga beripikadong may-ari o landlord nang walang nakatagong komisyon o middleman.",
    },
    {
      step: "03",
      title: "Lumipat na sa Tahanan",
      description: "Ayusin ang kasunduan at lumipat nang payapa at ligtas sa iyong bagong tirahan.",
    },
  ];

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* ── Section Header ── */}
      <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--forest-deep)]/15 bg-[var(--forest-deep)]/5 mb-4">
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--forest-deep)]">
            Mabilis at Ligtas
          </span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-black text-[var(--ink)] leading-tight tracking-tight">
            Paano Ito{" "}
            <span className="relative inline-block">
              Gumagana
              <svg
                aria-hidden="true"
                className="absolute -bottom-1.5 left-0 w-full"
                viewBox="0 0 200 8"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 6 Q25 1 50 5 Q75 9 100 4 Q125 -1 150 5 Q175 9 200 4"
                  stroke="var(--marigold)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
        </h2>
        <p className="font-body text-sm sm:text-base text-[var(--forest-deep)]/60 mt-3">
          Maghanap ng iyong susunod na tahanan sa tatlong madaling hakbang.
        </p>
      </div>

      {/* ── Steps Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
        {steps.map((item, index) => (
          <div
            key={index}
            className="group relative p-8 sm:p-10 rounded-3xl bg-white/60 backdrop-blur-md border border-[var(--forest-deep)]/10 shadow-sm hover:shadow-xl hover:border-[var(--marigold)]/50 transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            {/* Subtle background glow effect on hover */}
            <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-[var(--marigold)]/10 blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

            <div>
              {/* Step Indicator */}
              <div className="flex items-center justify-between mb-8">
                <span className="font-display text-3xl sm:text-4xl font-black text-[var(--marigold)] tracking-tighter">
                  {item.step}
                </span>
                <div className="h-px flex-1 bg-[var(--forest-deep)]/10 ml-4" />
              </div>

              {/* Title & Description */}
              <h3 className="font-display text-lg sm:text-xl font-bold text-[var(--forest-deep)] mb-3 group-hover:text-[var(--marigold)] transition-colors duration-300">
                {item.title}
              </h3>
              <p className="font-body text-xs sm:text-sm text-[var(--forest-deep)]/60 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Bottom accent line */}
            <div className="mt-8 pt-4 border-t border-[var(--forest-deep)]/5 flex items-center justify-between text-[11px] font-bold text-[var(--forest-deep)]/40 group-hover:text-[var(--forest-deep)] transition-colors">
              <span>Hakbang {index + 1} ng 3</span>
              <span className="transform translate-x-1 group-hover:translate-x-0 transition-transform duration-300">→</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}