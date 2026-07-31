"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, Search, Menu, X, Building2, MapPin } from "lucide-react";
import { cn } from "@/src/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/hanap-bahay" },
  { label: "Mga Paupahan", href: "/hanap-bahay/search" },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/hanap-bahay";

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  const isTransparent = isHome && !scrolled;

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (query.trim()) params.set("location", query.trim());
      router.push(
        `/hanap-bahay/search${params.toString() ? `?${params}` : ""}`,
      );
      setMobileSearchOpen(false);
      setMobileMenuOpen(false);
    },
    [query, router],
  );

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        isTransparent
          ? "bg-transparent"
          : "bg-[var(--paper)]/95 backdrop-blur-md shadow-sm border-b border-[var(--line)]",
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="/hanap-bahay" className="flex items-center gap-2.5 shrink-0">
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-300",
                isTransparent
                  ? "bg-white/15 backdrop-blur-md border border-white/25"
                  : "bg-[var(--marigold)]/15 border border-[var(--marigold)]/30",
              )}
            >
              <Home
                className={cn(
                  "h-4 w-4",
                  isTransparent
                    ? "text-[#FADA7A]"
                    : "text-[var(--marigold-deep)]",
                )}
              />
            </span>
            <span
              className={cn(
                "font-display font-black text-lg tracking-tight transition-colors duration-300",
                isTransparent ? "text-white" : "text-[var(--ink)]",
              )}
            >
              Hanap Bahay
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200",
                    isTransparent
                      ? active
                        ? "bg-white/15 text-white"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                      : active
                        ? "bg-[var(--marigold)]/12 text-[var(--marigold-deep)]"
                        : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--line)]/60",
                  )}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Desktop search */}
          <form
            onSubmit={handleSearchSubmit}
            className={cn(
              "hidden md:flex items-center gap-2 rounded-full pl-4 pr-1.5 py-1.5 transition-all duration-300 w-56 lg:w-72 focus-within:w-72 lg:focus-within:w-80",
              isTransparent
                ? "bg-white/12 backdrop-blur-md border border-white/20 focus-within:bg-white/18"
                : "bg-[var(--line)]/50 border border-[var(--line)] focus-within:border-[var(--marigold)]/50 focus-within:bg-[var(--paper-card)]",
            )}
          >
            <MapPin
              className={cn(
                "h-4 w-4 shrink-0",
                isTransparent ? "text-white/60" : "text-[var(--muted)]",
              )}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Saan ka maghahanap?"
              className={cn(
                "flex-1 min-w-0 bg-transparent text-sm outline-none",
                isTransparent
                  ? "text-white placeholder:text-white/50"
                  : "text-[var(--ink)] placeholder:text-[var(--muted)]",
              )}
            />
            <button
              type="submit"
              aria-label="Maghanap"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--marigold)] text-[var(--forest-deep)] hover:bg-[var(--accent-gold)] active:scale-95 transition-all duration-200"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Post property CTA - desktop */}
          <a
            href="/list-property"
            className={cn(
              "hidden lg:flex items-center gap-2 ml-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-200 active:scale-95 whitespace-nowrap",
              isTransparent
                ? "bg-white text-[#153730] hover:bg-[var(--paper)]"
                : "bg-[var(--forest-deep)] text-[var(--paper)] hover:bg-[var(--forest)]",
            )}
          >
            <Building2 className="h-4 w-4" />
            Mag-post
          </a>

          {/* Mobile controls */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              type="button"
              aria-label="Maghanap"
              onClick={() => setMobileSearchOpen((v) => !v)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200",
                isTransparent
                  ? "text-white hover:bg-white/10"
                  : "text-[var(--ink)] hover:bg-[var(--line)]/60",
              )}
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label={mobileMenuOpen ? "Isara ang menu" : "Buksan ang menu"}
              onClick={() => setMobileMenuOpen((v) => !v)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200",
                isTransparent
                  ? "text-white hover:bg-white/10"
                  : "text-[var(--ink)] hover:bg-[var(--line)]/60",
              )}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile search - expandable */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-out",
            mobileSearchOpen
              ? "max-h-16 opacity-100 pb-3"
              : "max-h-0 opacity-0",
          )}
        >
          <form
            onSubmit={handleSearchSubmit}
            className={cn(
              "flex items-center gap-2 rounded-full pl-4 pr-1.5 py-1.5",
              isTransparent
                ? "bg-white/12 backdrop-blur-md border border-white/20"
                : "bg-[var(--line)]/50 border border-[var(--line)]",
            )}
          >
            <MapPin
              className={cn(
                "h-4 w-4 shrink-0",
                isTransparent ? "text-white/60" : "text-[var(--muted)]",
              )}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Saan ka maghahanap?"
              autoFocus={mobileSearchOpen}
              className={cn(
                "flex-1 min-w-0 bg-transparent text-sm outline-none",
                isTransparent
                  ? "text-white placeholder:text-white/50"
                  : "text-[var(--ink)] placeholder:text-[var(--muted)]",
              )}
            />
            <button
              type="submit"
              aria-label="Maghanap"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--marigold)] text-[var(--forest-deep)] active:scale-95 transition-all duration-200"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-out border-t",
          mobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0",
          isTransparent
            ? "border-white/10 bg-[var(--forest-deep)]/95 backdrop-blur-md"
            : "border-[var(--line)] bg-[var(--paper)]",
        )}
      >
        <div className="px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200",
                  isTransparent
                    ? active
                      ? "bg-white/15 text-white"
                      : "text-white/80 hover:bg-white/10"
                    : active
                      ? "bg-[var(--marigold)]/12 text-[var(--marigold-deep)]"
                      : "text-[var(--muted)] hover:bg-[var(--line)]/60 hover:text-[var(--ink)]",
                )}
              >
                {link.label}
              </a>
            );
          })}
          <a
            href="/list-property"
            className={cn(
              "mt-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors duration-200",
              isTransparent
                ? "bg-white text-[#153730]"
                : "bg-[var(--forest-deep)] text-[var(--paper)]",
            )}
          >
            <Building2 className="h-4 w-4" />
            Mag-post ng Ari-arian
          </a>
        </div>
      </div>
    </header>
  );
}
