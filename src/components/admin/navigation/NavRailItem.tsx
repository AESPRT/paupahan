"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavItem } from "./nav-data";

function NavIcon({ name }: { name: string }) {
  const props = { className: "h-5 w-5 stroke-[2.2]" };

  switch (name) {
    case "dashboard":
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
          <rect x="3" y="3" width="7" height="9" rx="2" />
          <rect x="14" y="3" width="7" height="5" rx="2" />
          <rect x="14" y="12" width="7" height="9" rx="2" />
          <rect x="3" y="16" width="7" height="5" rx="2" />
        </svg>
      );
    case "tenant":
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      );
    case "units":
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case "utilities":
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "billings":
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
          <rect x="2" y="5" width="20" height="14" rx="3" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      );
    case "reports":
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case "notifications":
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      );
    case "audit-logs":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      );
    case "subscriptions":
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    case "maintenance":
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "settings":
      return (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      );
    default:
      return null;
  }
}

// Maliit na Lock SVG Icon para sa naka-lock o disabled items
function LockIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

interface NavRailItemProps {
  item: NavItem;
  isMobile?: boolean;
  onSelect?: () => void;
}

export function NavRailItem({ item, isMobile = false, onSelect }: NavRailItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
  const isLocked = item.disabled; // 👈 Ginamit ang disabled property mula sa NavItem

  // Mobile Row Layout
  if (isMobile) {
    return (
      <Link
        href={isLocked ? "/admin/dashboard/subscriptions" : item.href}
        onClick={onSelect}
        className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 transition-all ${
          isLocked
            ? "opacity-60 bg-paper/50 text-muted hover:bg-paper"
            : isActive
            ? "bg-coral font-bold text-white shadow-sm"
            : "text-muted hover:bg-paper hover:text-forest-deep"
        }`}
      >
        <div className="flex items-center gap-3">
          <NavIcon name={item.icon} />
          <span className="text-sm">{item.label}</span>
        </div>

        {/* Badge o kaya ay Lock Icon kung naka-lock */}
        {isLocked ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forest/10 text-forest-deep">
            <LockIcon />
          </span>
        ) : (
          item.badge && (
            <span
              className={`rounded-full px-2 py-0.5 font-mono-brand text-[10px] font-bold ${
                isActive ? "bg-white text-coral-deep" : "bg-marigold text-forest-deep"
              }`}
            >
              {item.badge}
            </span>
          )
        )}
      </Link>
    );
  }

  // Desktop Vertical Rail Layout
  return (
    <Link
      href={isLocked ? "/admin/dashboard/subscriptions" : item.href}
      className="group relative flex flex-col items-center justify-center gap-1 focus:outline-none"
    >
      <div
        className={`relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 ${
          isLocked
            ? "opacity-60 bg-forest/5 text-muted grayscale"
            : isActive
            ? "bg-coral text-white shadow-[0_6px_16px_rgba(225,91,78,0.35)] group-hover:scale-105 active:scale-95"
            : "text-muted hover:bg-forest/10 hover:text-forest-deep group-hover:scale-105 active:scale-95"
        }`}
      >
        <NavIcon name={item.icon} />

        {/* Lock badge kung naka-lock, o notification badge kung active */}
        {isLocked ? (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-forest-deep text-white shadow-sm">
            <LockIcon />
          </span>
        ) : (
          item.badge && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-marigold px-1 font-mono-brand text-[10px] font-extrabold text-forest-deep shadow-sm">
              {item.badge}
            </span>
          )
        )}
      </div>

      <span
        className={`font-mono-brand text-[10.5px] font-semibold tracking-tight transition-colors ${
          isLocked
            ? "text-muted/60"
            : isActive
            ? "font-bold text-forest-deep"
            : "text-muted/80 group-hover:text-forest-deep"
        }`}
      >
        {item.label}
      </span>
    </Link>
  );
}