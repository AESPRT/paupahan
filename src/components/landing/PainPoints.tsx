const PAINS = [
  {
    icon: "📒",
    title: "Notebook na puno ng tanggal",
    body: "Hirap makita kung sino na ang nagbayad at kung sino pa ang may utang, lalo na kung marami nang pahina.",
  },
  {
    icon: "💬",
    title: "Follow-up sa Messenger tuwing buwan",
    body: '"Pa-remind lang po" paulit-ulit sa bawat tenant — sayang ang oras na pwede sana sa ibang bagay.',
  },
  {
    icon: "📉",
    title: "Hindi malinaw ang kita",
    body: "Mahirap malaman kung talagang kumikita ka kada buwan kapag scattered sa iba't ibang tala ang mga numero.",
  },
];

export function PainPoints() {
  return (
    <section className="py-13 sm:py-16 lg:py-[84px]" id="pain">
      <div className="mx-auto max-w-[1140px] px-4.5 sm:px-6">
        <div className="mx-auto mb-8 max-w-[600px] text-center sm:mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-coral-deep/25 bg-coral-deep/[0.09] px-3 py-1.5 font-mono-brand text-[12.5px] font-semibold uppercase tracking-[0.08em] text-coral-deep">
            Kilala mo ba ito?
          </span>
          <h2 className="mt-3.5 font-display text-[28px] font-bold text-forest-deep sm:text-[34px] lg:text-[38px]">
            Ang pagpapatakbo ng paupahan, hindi dapat ganito.
          </h2>
          <p className="mt-3.5 text-[16.5px] leading-relaxed text-muted">
            Kung pamilyar sa&apos;yo ang mga ito, para sa&apos;yo ang Paupahan.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5.5 md:grid-cols-3">
          {PAINS.map((p) => (
            <div key={p.title} className="rounded-[18px] border border-line bg-paper-card p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-coral/10 text-xl">
                {p.icon}
              </div>
              <h3 className="mb-2 text-[16.5px] font-bold text-forest-deep">{p.title}</h3>
              <p className="text-[14.5px] leading-relaxed text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
