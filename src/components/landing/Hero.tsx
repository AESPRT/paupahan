import { Button } from "./Button";

export function Hero() {
  return (
    <section className="overflow-hidden py-10 sm:py-16 lg:py-[76px]">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-coral-deep/25 bg-coral-deep/[0.09] px-3 py-1.5 font-mono-brand text-[12px] font-semibold uppercase tracking-[0.08em] text-coral-deep sm:text-[12.5px]">
              Para sa mga may paupahan
            </span>
            <h1 className="mt-4 font-display text-[30px] font-bold leading-[1.12] tracking-tight text-forest-deep sm:text-[42px] lg:text-[54px]">
              Renta, bayad, at tenant — <span className="text-coral">nasa isang lugar</span> na lang.
            </h1>
            <p className="mx-auto mt-4 max-w-[480px] text-base leading-relaxed text-muted sm:text-lg lg:mx-0">
              Paupahan ang nag-a-alaga ng monthly billing, reminders, at tenant records mo —
              kahit isang unit lang ang bahay-paupahan mo, o limampu.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
              <Button href="/admin-register" variant="primary">Simulan Nang Libre</Button>
              <Button href="#how" variant="ghost">Tingnan Paano Gumagana</Button>
            </div>
            <div className="mt-6 flex items-center justify-center gap-2.5 text-[13px] font-semibold text-muted lg:justify-start">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-marigold-deep" />
              Walang credit card kailangan sa 14-day trial
            </div>
          </div>

          <div className="relative flex justify-center py-6 sm:py-5">
            <div className="absolute left-2 top-0 hidden -rotate-6 items-center gap-1.5 rounded-xl bg-forest px-3 py-2 text-[12px] font-semibold text-white shadow-lg sm:flex sm:left-[-18px] sm:top-[-6px] sm:text-[12.5px]">
              🔔 Reminder na-send
            </div>

            <div className="perforated relative w-full max-w-[300px] rotate-[-2deg] rounded-2xl border border-line bg-paper-card p-5 pb-7 shadow-[0_14px_34px_rgba(27,58,52,0.12)] sm:max-w-[340px] sm:rotate-[-3.5deg] sm:p-6 sm:pb-[30px]">
              <div className="mb-3.5 flex items-start justify-between border-b-[1.5px] border-dashed border-line pb-3.5">
                <div>
                  <div className="font-mono-brand text-[10px] tracking-wide text-muted sm:text-[11px]">RESIBO NG BAYARIN</div>
                  <div className="mt-1 font-display text-[15px] font-bold text-forest-deep sm:text-[17px]">Unit 2B · Rosales Apartments</div>
                </div>
                <div className="font-mono-brand text-[10px] text-muted sm:text-[11px]">Agosto 2026</div>
              </div>

              <div className="flex justify-between py-1.5 font-mono-brand text-[13px] text-ink sm:text-[13.5px]">
                <span>Renta</span><span>₱6,500.00</span>
              </div>
              <div className="flex justify-between py-1.5 font-mono-brand text-[13px] text-muted sm:text-[13.5px]">
                <span>Tubig</span><span>₱200.00</span>
              </div>
              <div className="flex justify-between py-1.5 font-mono-brand text-[13px] text-muted sm:text-[13.5px]">
                <span>Kuryente (meter)</span><span>₱845.00</span>
              </div>

              <div className="mt-3.5 flex items-center justify-between border-t-[1.5px] border-dashed border-line pt-3.5 font-mono-brand font-semibold">
                <span>Kabuuan</span>
                <span className="text-[20px] text-forest-deep sm:text-[22px]">₱7,545.00</span>
              </div>

              <div className="stamp-anim absolute right-[-6px] top-[38%] rounded-[10px] border-[3px] border-coral bg-paper-card/90 px-3 py-1 font-display text-[18px] font-extrabold tracking-wide text-coral sm:px-3.5 sm:py-1.5 sm:text-[22px]">
                BAYAD NA
              </div>
            </div>

            <div className="absolute bottom-0 right-2 hidden rotate-3 items-center gap-1.5 rounded-xl bg-marigold px-3 py-2 text-[12px] font-semibold text-forest-deep shadow-lg sm:flex sm:bottom-1.5 sm:right-[-22px] sm:text-[12.5px]">
              📊 96% collection rate
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
