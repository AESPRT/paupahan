import { PaupahanLogo } from "@/src/components/ui/PaupahanLogo";

interface FooterProps {
  showNavLinks?: boolean;
}

export function Footer({ showNavLinks = true }: FooterProps) {
  return (
    <footer className="border-t border-line py-9">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <PaupahanLogo size={38} />

          {/* Conditional Navigation Links */}
          {showNavLinks && (
            <div className="flex flex-wrap items-center justify-center gap-4 text-[13.5px] font-semibold text-muted sm:gap-[26px]">
              <a href="#features" className="transition-colors hover:text-forest-deep">
                Features
              </a>
              <a href="#pricing" className="transition-colors hover:text-forest-deep">
                Pricing
              </a>
              <a href="#faq" className="transition-colors hover:text-forest-deep">
                FAQ
              </a>
            </div>
          )}

          <div className="max-w-[220px] text-center text-[12.5px] text-muted sm:max-w-none sm:text-left sm:text-[13px]">
            © 2026 Paupahan. Ginawa para sa mga may-ari ng paupahan sa Pilipinas.
          </div>
        </div>
      </div>
    </footer>
  );
}