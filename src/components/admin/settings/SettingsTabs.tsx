"use client";

import { User, Building2, Wallet, ShieldCheck, type LucideIcon } from "lucide-react";

export type TabType = "profile" | "property" | "payment" | "security";

interface SettingsTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TABS: { id: TabType; label: string; shortLabel: string; icon: LucideIcon }[] = [
  { id: "profile", label: "Profile Settings", shortLabel: "Profile", icon: User },
  { id: "property", label: "Property & Rates", shortLabel: "Property", icon: Building2 },
  { id: "payment", label: "Payment Methods", shortLabel: "Payment", icon: Wallet },
  { id: "security", label: "Security & Alerts", shortLabel: "Security", icon: ShieldCheck },
];

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="relative">
      <div
        role="tablist"
        aria-label="Settings sections"
        className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-line bg-paper p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`group relative inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 font-mono-brand text-xs font-bold transition-all duration-200 sm:px-4 ${isActive
                  ? "bg-forest text-white shadow-[0_2px_10px_rgba(31,75,63,0.25)]"
                  : "text-muted hover:bg-line/40 hover:text-forest-deep"
                }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isActive ? "scale-105" : "group-hover:scale-105"
                  }`}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Edge fade hints that there's more to scroll on mobile */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 rounded-r-2xl bg-gradient-to-l from-paper to-transparent sm:hidden" aria-hidden="true" />
    </div>
  );
}