export function Footer() {
  return (
    <footer className="border-t border-line py-9">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-2.5 font-display text-lg font-extrabold text-forest-deep">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest font-mono-brand text-[13px] text-marigold">
              P
            </span>
            Paupahan
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[13.5px] font-semibold text-muted sm:gap-6.5">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="max-w-[220px] text-center text-[12.5px] text-muted sm:max-w-none sm:text-left sm:text-[13px]">© 2026 Paupahan. Ginawa para sa mga may-ari ng paupahan sa Pilipinas.</div>
        </div>
      </div>
    </footer>
  );
}
