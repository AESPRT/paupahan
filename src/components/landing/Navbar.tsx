"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import { PaupahanLogo } from "../ui/PaupahanLogo";

const LINKS = [
  { href: "/hanap-bahay", label: "Hanap Bahay" }, // 👈 Idinagdag para sa mga seekers/visitors
  { href: "#features", label: "Features" },
  { href: "#how", label: "Paano Gumagana" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) setOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6">
        <nav className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-display text-[20px] font-extrabold text-forest-deep sm:text-[22px]">
            <PaupahanLogo className="w-8 h-8" />
            Paupahan
          </Link>

          {/* Desktop nav — hidden below lg */}
          <div className="hidden items-center gap-6 text-[15px] font-semibold text-forest-deep lg:flex xl:gap-8">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`opacity-80 transition-opacity hover:opacity-100 ${l.href === "/properties" ? "text-marigold-deep font-bold opacity-100" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA buttons — hidden below lg */}
          <div className="hidden items-center gap-3 lg:flex">
            <Button href="/admin/login" variant="ghost" className="!px-5 !py-2.5 !text-sm">
              Mag-login
            </Button>
            <Button href="/admin/register" variant="primary" className="!px-5 !py-2.5 !text-sm">
              Simulan Ngayon
            </Button>
          </div>

          {/* Hamburger — visible below lg */}
          <button
            aria-label={open ? "Isara ang menu" : "Buksan ang menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-[10px] border-[1.5px] border-line bg-paper-card lg:hidden focus-visible:outline focus-visible:outline-3 focus-visible:outline-marigold-deep"
          >
            <span
              className={`h-0.5 w-[18px] rounded bg-forest-deep transition-all duration-300 ${open ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span className={`h-0.5 w-[18px] rounded bg-forest-deep transition-all duration-300 ${open ? "opacity-0 scale-x-0" : ""}`} />
            <span
              className={`h-0.5 w-[18px] rounded bg-forest-deep transition-all duration-300 ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
            />
          </button>
        </nav>
      </div>

      {/* Mobile/Tablet dropdown menu */}
      <div
        id="mobile-menu"
        role="menu"
        className={`overflow-hidden border-b border-line bg-paper-card shadow-[0_16px_28px_rgba(21,55,48,0.12)] transition-[max-height,opacity] duration-300 ease-in-out lg:hidden ${open ? "max-h-[calc(100dvh-64px)] opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="flex flex-col overflow-y-auto">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`border-b border-line px-5 py-4 text-[15px] font-semibold text-forest-deep transition-colors hover:bg-forest/[0.04] sm:px-6 ${l.href === "/properties" ? "bg-forest/[0.02] text-marigold-deep font-bold" : ""}`}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2.5 px-5 py-4 sm:px-6">
            <Button href="/admin/login" variant="ghost" onClick={() => setOpen(false)} className="!py-3 !text-sm">
              Mag-login
            </Button>
            <Button href="/admin/register" variant="primary" onClick={() => setOpen(false)} className="!py-3 !text-sm">
              Simulan Ngayon
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}