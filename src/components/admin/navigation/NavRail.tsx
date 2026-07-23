"use client";

import { useState } from "react";
import Link from "next/link";
import { DASHBOARD_NAV_ITEMS } from "./nav-data";
import { NavRailItem } from "./NavRailItem";
import { PaupahanLogo } from "@/src/components/ui/PaupahanLogo";

export function NavRail() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* ---------------------------------------------------- */}
      {/* 1. MOBILE TOP BAR                                    */}
      {/* ---------------------------------------------------- */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-line bg-paper-card px-4 shadow-sm md:hidden">
        <Link
          href="/admin/dashboard/home"
          className="flex items-center gap-2.5 font-display text-lg font-bold text-forest-deep"
        >
          <PaupahanLogo size={38}/>
          <span>Paupahan</span>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-paper text-forest-deep transition-all active:scale-95"
        >
          {isOpen ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* ---------------------------------------------------- */}
      {/* 2. MOBILE DRAWER OVERLAY & SCROLLABLE MENU           */}
      {/* ---------------------------------------------------- */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-forest-deep/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Container */}
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-line bg-paper-card p-5 shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Drawer Header (Fixed) */}
            <div className="flex items-center justify-between border-b border-line pb-4">
              <Link
                href="/admin/dashboard/home"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 font-display text-lg font-bold text-forest-deep"
              >
                <PaupahanLogo size={42}/>
                <span>Paupahan</span>
              </Link>

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-muted hover:bg-forest/10 hover:text-forest-deep"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Mobile Nav Items */}
            <nav className="my-4 flex-1 space-y-1.5 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {DASHBOARD_NAV_ITEMS.map((item) => (
                <NavRailItem
                  key={item.id}
                  item={item}
                  isMobile
                  onSelect={() => setIsOpen(false)}
                />
              ))}
            </nav>

            {/* Drawer Footer (Fixed) */}
            <div className="border-t border-line pt-4">
              <Link
                href="/admin/dashboard/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-paper"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-coral bg-coral/10 font-mono-brand text-xs font-bold text-coral-deep">
                  JD
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-forest-deep">Juan Dela Cruz</p>
                  <p className="text-[11px] text-muted">Property Admin</p>
                </div>
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. DESKTOP / TABLET SCROLLABLE RAIL (≥ md)            */}
      {/* ---------------------------------------------------- */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[88px] flex-col items-center justify-between border-r border-line bg-paper-card py-5 shadow-[4px_0_24px_rgba(27,58,52,0.04)] md:flex">
        {/* Top Logo (Fixed) */}
        <div className="flex shrink-0 flex-col items-center gap-3">
          <Link
            href="/admin/dashboard/home"
            className="flex items-center gap-2.5 font-display text-lg font-bold text-forest-deep"
          >
            <PaupahanLogo size={42}/>
          </Link>

          <div className="h-[1px] w-8 bg-line" />
        </div>

        {/* Scrollable Center Menu Icons */}
        <nav className="my-3 flex w-full flex-1 flex-col items-center gap-4 overflow-y-auto px-2 py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {DASHBOARD_NAV_ITEMS.map((item) => (
            <NavRailItem key={item.id} item={item} />
          ))}
        </nav>

        {/* Bottom User Profile (Fixed) */}
        <div className="flex shrink-0 flex-col items-center gap-3">
          <div className="h-[1px] w-8 bg-line" />
          <Link
            href="/admin/dashboard/profile"
            className="group relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-forest/30 bg-coral/10 font-mono-brand text-xs font-bold text-coral-deep shadow-sm transition-all hover:scale-105 hover:border-coral"
          >
            JD
            <div className="pointer-events-none absolute left-full z-50 ml-3 hidden rounded-xl border border-line bg-forest-deep px-3 py-1.5 text-xs font-semibold text-white shadow-lg group-hover:block whitespace-nowrap">
              Juan Dela Cruz
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}