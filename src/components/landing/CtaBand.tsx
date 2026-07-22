import { Button } from "./Button";

export function CtaBand() {
  return (
    <section className="px-4.5 pb-13 sm:px-6 sm:pb-16 lg:pb-[84px]">
      <div className="mx-auto max-w-[1140px]">
        <div className="overflow-hidden rounded-[18px] bg-coral px-5.5 py-10 text-center text-white sm:rounded-3xl sm:px-10 sm:py-14">
          <h2 className="font-display text-[26px] font-bold text-white sm:text-[32px] lg:text-[36px]">
            Handa ka na bang tumigil sa pag-follow-up?
          </h2>
          <p className="mx-auto mt-3 max-w-[480px] text-base text-white/85">
            Sumali sa mga may-ari ng paupahan na hindi na kailangang mag-alala sa bayarin bawat buwan.
          </p>
          <div className="mt-6.5 flex flex-col items-stretch justify-center gap-3.5 sm:flex-row sm:items-center">
            <Button href="#pricing" variant="primary" className="!bg-white !text-coral-deep !shadow-none">
              Simulan Nang Libre
            </Button>
            <Button href="#pricing" variant="ghost" className="!border-white/70 !text-white hover:!bg-white/10">
              Tingnan ang Presyo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
