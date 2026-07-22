const STEPS = [
  { num: 1, title: "Idagdag ang mga unit", body: "I-list ang mga bahay-paupahan o unit mo, kasama ang renta at ibang detalye." },
  { num: 2, title: "Idagdag ang mga tenant", body: "Ilagay ang tenant ng bawat unit — pangalan, contact, at petsa ng bayarin." },
  { num: 3, title: "Hayaan si Paupahan", body: "Awtomatiko nang gagawa ng resibo, magpapadala ng reminder, at magta-track ng bayad kada buwan." },
];

export function HowItWorks() {
  return (
    <section className="py-13 sm:py-16 lg:py-[84px]" id="how">
      <div className="mx-auto max-w-[1140px] px-4.5 sm:px-6">
        <div className="mx-auto mb-8 max-w-[600px] text-center sm:mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-coral-deep/25 bg-coral-deep/[0.09] px-3 py-1.5 font-mono-brand text-[12.5px] font-semibold uppercase tracking-[0.08em] text-coral-deep">
            Tatlong hakbang lang
          </span>
          <h2 className="mt-3.5 font-display text-[28px] font-bold text-forest-deep sm:text-[34px] lg:text-[38px]">
            Paano gumagana
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.num} className="flex flex-col">
              <div className="mb-4 flex h-8.5 w-8.5 items-center justify-center rounded-full bg-coral/10 font-display text-[15px] font-extrabold text-coral">
                {s.num}
              </div>
              <h3 className="mb-2 text-[16px] font-bold text-forest-deep sm:text-[17px]">{s.title}</h3>
              <p className="text-[14.5px] leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
