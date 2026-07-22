"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { NavItem } from "@/src/types/navigation";

// SVG Icons Definition (Inline SVGs for performance and zero external dependencies)
const Icons = {
  Dashboard: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Bills: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2-2 4 4m0-7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0zM3 20h18M3 4h18" />
    </svg>
  ),
  Utilities: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Maintenance: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  History: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Settings: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  ),
  Logout: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Menu: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Close: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  HomeBrand: ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h5m-5 0V11m0 0h2M10 11H8" />
    </svg>
  ),
};

interface TenantNavItem extends Omit<NavItem, "icon"> {
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: TenantNavItem[] = [
  { id: "dashboard", label: "Dashboard", path: "/tenant/dashboard", icon: Icons.Dashboard },
  { id: "bills", label: "Bills", path: "/tenant/bills", icon: Icons.Bills },
  { id: "utilities", label: "Utilities", path: "/tenant/utilities", icon: Icons.Utilities },
  { id: "maintenance", label: "Maintenance", path: "/tenant/maintenance", icon: Icons.Maintenance },
  { id: "history", label: "History", path: "/tenant/history", icon: Icons.History },
  { id: "settings", label: "Settings", path: "/tenant/settings", icon: Icons.Settings },
];

export function TenantNavigationRail() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Unang 4 items para sa Bottom Nav Bar sa Mobile
  const mobilePrimaryNav = NAV_ITEMS.slice(0, 4);

  return (
    <>
      {/* ========================================================= */}
      {/* 1. DESKTOP & TABLET SIDEBAR / NAVIGATION RAIL (lg:flex)   */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-40 border-r border-line bg-paper-card p-4 shadow-sm">
        {/* Branding Header */}
        <div className="flex items-center gap-3 px-3 py-4 border-b border-line/60">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-forest/10 text-forest shadow-xs">
            <Icons.HomeBrand className="w-5 h-5 text-forest" />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold text-forest-deep">
              Tenant Portal
            </h1>
            <p className="text-[10px] text-muted font-mono-brand">
              Paupahan System
            </p>
          </div>
        </div>

        {/* Menu Navigation Links */}
        <nav className="mt-6 flex-1 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            const IconComponent = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`group flex w-full items-center gap-3.5 rounded-2xl px-3.5 py-3 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-forest text-white shadow-sm"
                    : "text-muted hover:bg-paper hover:text-forest-deep"
                }`}
              >
                <IconComponent
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive ? "text-white" : "text-muted group-hover:text-forest-deep"
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick User / Logout Footer */}
        <div className="border-t border-line/60 pt-4">
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("tenant_code");
              }
              router.push("/tenant/login");
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-coral-deep hover:bg-coral/10 transition-colors"
          >
            <Icons.Logout className="w-5 h-5" />
            <span>Mag-log Out</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MOBILE BOTTOM NAVIGATION BAR (lg:hidden)               */}
      {/* ========================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-line bg-paper-card/95 px-2 py-2 backdrop-blur-md lg:hidden">
        {mobilePrimaryNav.map((item) => {
          const isActive = pathname === item.path;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-all ${
                isActive ? "text-forest" : "text-muted"
              }`}
            >
              <IconComponent className={`w-5 h-5 ${isActive ? "text-forest" : "text-muted"}`} />
              <span className="font-mono-brand text-[10px] font-bold">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* "More" Trigger Button for Mobile Drawer */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-muted"
        >
          <Icons.Menu className="w-5 h-5 text-muted" />
          <span className="font-mono-brand text-[10px] font-bold">Higit Pa</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3. MOBILE SLIDE-OUT DRAWER FOR EXTRA MENU                 */}
      {/* ========================================================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs lg:hidden">
          <div className="w-4/5 max-w-xs h-full bg-paper-card p-5 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h3 className="font-display text-sm font-bold text-forest-deep">
                Iba pang mga Menu
              </h3>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-full p-1 text-muted hover:bg-paper"
              >
                <Icons.Close className="w-5 h-5" />
              </button>
            </div>

            <nav className="mt-4 flex-1 space-y-2">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.path;
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push(item.path);
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition-all ${
                      isActive
                        ? "bg-forest text-white"
                        : "text-muted hover:bg-paper hover:text-forest-deep"
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 ${isActive ? "text-white" : "text-muted"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-line pt-4">
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("tenant_code");
                  }
                  router.push("/tenant/login");
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold text-coral-deep hover:bg-coral/10"
              >
                <Icons.Logout className="w-5 h-5" />
                <span>Mag-log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}