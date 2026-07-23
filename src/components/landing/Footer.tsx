import { PaupahanLogo } from "@/src/components/ui/PaupahanLogo";

interface FooterProps {
  showNavLinks?: boolean;
}

export function Footer({ showNavLinks = true }: FooterProps) {
  return (
    <footer className="border-t border-line py-10 sm:py-12">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
        <div className="flex flex-col items-center text-center gap-6">
          
          {/* Logo Section (Nasa taas, mas malaki sa desktop) */}
          <div className="flex justify-center transform scale-110 sm:scale-125 transition-transform">
            <PaupahanLogo size={42} />
          </div>

          {/* Conditional Navigation Links */}
          {showNavLinks && (
            <nav className="flex flex-wrap items-center justify-center gap-6 text-[13.5px] font-semibold text-muted">
              <a href="#features" className="transition-colors hover:text-forest-deep">
                Features
              </a>
              <a href="#pricing" className="transition-colors hover:text-forest-deep">
                Pricing
              </a>
              <a href="#faq" className="transition-colors hover:text-forest-deep">
                FAQ
              </a>
            </nav>
          )}

          {/* Copyright Text */}
          <div className="text-[12.5px] text-muted sm:text-[13px]">
            © 2026 Paupahan. Ginawa para sa mga may-ari ng paupahan sa Pilipinas.
          </div>

        </div>
      </div>
    </footer>
  );
}