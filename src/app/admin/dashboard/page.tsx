import { DashboardHeader } from "@/src/components/admin/dashboard/DashboardHeader";
import { StatCards } from "@/src/components/admin/dashboard/StatCards";
import { RevenueChart } from "@/src/components/admin/dashboard/RevenueChart";
import { PendingApprovals } from "@/src/components/admin/dashboard/PendingApprovals";
import { RecentActivities } from "@/src/components/admin/dashboard/RecentActivities";
import { AdminAuditLogs } from "@/src/components/admin/dashboard/AdminAuditLogs";
import { Footer } from "@/src/components/landing/Footer";

export const metadata = {
  title: "Dashboard | Paupahan Admin",
  description: "Buod ng mga aktibidad, kita, at paupahan.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Header Component */}
      <DashboardHeader />

      {/* 1. Stat Summary Section */}
      <section aria-label="Quick Statistics">
        <StatCards />
      </section>

      {/* 2. Main Analytics & Activity Grid */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Analytics & Approvals Area */}
        <div className="space-y-6 lg:col-span-2">
          <RevenueChart />
          <PendingApprovals />
        </div>

        {/* Notifications & Audit Logs Sidebar */}
        <div className="space-y-6">
          <RecentActivities />
          <AdminAuditLogs />
        </div>
      </section>
      <Footer showNavLinks = {false} />
    </div>
  );
}