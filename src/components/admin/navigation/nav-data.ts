export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string; // Key para sa Icon lookup
  badge?: string;
}

export const DASHBOARD_NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { id: "tenant", label: "Tenants", href: "/admin/tenants", icon: "tenant" },
  { id: "units", label: "Units", href: "/admin/units", icon: "units" },
  { id: "utilities", label: "Utilities", href: "/admin/utilities", icon: "utilities" },
  { id: "billings", label: "Billings", href: "/admin/billings", icon: "billings", badge: "2" },
  { id: "reports", label: "Reports", href: "/admin/reports", icon: "reports" },
  { id: "subscriptions", label: "Subscriptions", href: "/admin/subscriptions", icon: "subscriptions" },
  { id: "maintenance", label: "Maintenance", href: "/admin/maintenance", icon: "maintenance", badge: "!" },
  { id: "settings", label: "Settings", href: "/admin/settings", icon: "settings" },
];