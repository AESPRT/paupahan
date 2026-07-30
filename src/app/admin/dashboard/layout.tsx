export const dynamic = 'force-dynamic';

import { NavRail } from "@/src/components/admin/navigation/NavRail";
import { NavExpandProvider } from "@/src/components/admin/navigation/NavExpandContext";
import { DashboardShell } from "@/src/components/admin/navigation/DashboardShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <NavExpandProvider>
      <div className="min-h-screen bg-paper text-ink">
        <NavRail />
        <DashboardShell>{children}</DashboardShell>
      </div>
    </NavExpandProvider>
  );
}