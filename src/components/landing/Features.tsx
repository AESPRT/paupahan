const FEATURES = [
  {
    icon: "🏠",
    title: "Tenant & Unit Tracking",
    body: "Listahan ng lahat ng unit, sino ang nakatira, kailan nag-start ang kontrata, at kung ilang buwan pa bago matapos.",
  },
  {
    icon: "🧾",
    title: "Auto-billing kada buwan",
    body: "Gumagawa mismo ng resibo bawat buwan base sa renta at bayarin ng tenant — hindi mo na kailangang i-compute isa-isa.",
  },
  {
    icon: "🔔",
    title: "Reminders na hindi mo pinapadala",
    body: "Awtomatikong paalala bago at pagkatapos ng due date, sa SMS, email, o sa app — walang follow-up na kailangan mula sa'yo.",
  },
  {
    icon: "📊",
    title: "Malinaw na kita bawat buwan",
    body: "Occupancy rate, collection rate, at kabuuang kita — makikita mo agad kung paano umaandar ang bahay-paupahan mo.",
  },
];

export function Features() {
  return (
    <section className="bg-forest-deep py-13 text-white sm:py-16 lg:py-[84px]" id="features">
      <div className="mx-auto max-w-[1140px] px-4.5 sm:px-6">
        <div className="mx-auto mb-8 max-w-[600px] text-center sm:mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-marigold/35 bg-marigold/[0.15] px-3 py-1.5 font-mono-brand text-[12.5px] font-semibold uppercase tracking-[0.08em] text-marigold">
            Ang laman ng Paupahan
          </span>
          <h2 className="mt-3.5 font-display text-[28px] font-bold text-white sm:text-[34px] lg:text-[38px]">
            Apat na bagay na kaya nitong gawin para sa&apos;yo
          </h2>
          <p className="mt-3.5 text-[16.5px] leading-relaxed text-white/65">
            Hindi kailangan ng maraming app — nasa isa na ang lahat.
          </p>
        </div>

        <div className="overflow-hidden rounded-[18px] border border-white/[0.14]">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`flex flex-col gap-2 px-5 py-5.5 sm:px-7 sm:py-6 md:grid md:grid-cols-[64px_1fr_1.4fr] md:items-center md:gap-5 ${
                i !== FEATURES.length - 1 ? "border-b border-white/10" : ""
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-marigold/[0.16] text-[18px] text-marigold sm:h-11 sm:w-11 sm:text-[19px] md:h-11 md:w-11">
                {f.icon}
              </div>
              <div className="font-display text-[16px] font-bold sm:text-lg">{f.title}</div>
              <div className="text-[14px] leading-relaxed text-white/65 sm:text-[14.5px] md:text-white/68">{f.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
