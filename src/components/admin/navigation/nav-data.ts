export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string; // Key para sa Icon lookup
  badge?: string;
}

export const DASHBOARD_NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/admin/dashboard/home", icon: "dashboard" },
  { id: "tenant", label: "Tenants", href: "/admin/dashboard/tenants", icon: "tenant" },
  { id: "units", label: "Units", href: "/admin/dashboard/units", icon: "units" },
  { id: "utilities", label: "Utilities", href: "/admin/dashboard/utilities", icon: "utilities" },
  { id: "billings", label: "Billings", href: "/admin/dashboard/billings", icon: "billings", badge: "2" },
  { id: "reports", label: "Reports", href: "/admin/dashboard/reports", icon: "reports" },
  { id: "notifications", label: "Notifications", href: "/admin/dashboard/notifications", icon: "notifications" },
  { id: "audit_logs", label: "Audit Logs", href: "/admin/dashboard/audit-logs", icon: "audit-logs" },
  { id: "subscriptions", label: "Subscriptions", href: "/admin/dashboard/subscriptions", icon: "subscriptions" },
  { id: "maintenance", label: "Maintenance", href: "/admin/dashboard/maintenance", icon: "maintenance", badge: "!" },
  { id: "settings", label: "Settings", href: "/admin/dashboard/settings", icon: "settings" },
];