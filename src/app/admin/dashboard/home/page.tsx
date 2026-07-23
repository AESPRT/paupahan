import { DashboardHeader } from "@/src/components/admin/dashboard/DashboardHeader";
import { StatCards } from "@/src/components/admin/dashboard/StatCards";
import { RevenueChart } from "@/src/components/admin/dashboard/RevenueChart";
import { PendingApprovals } from "@/src/components/admin/dashboard/PendingApprovals";
import { RecentActivities } from "@/src/components/admin/dashboard/RecentActivities";
import { AdminAuditLogs } from "@/src/components/admin/dashboard/AdminAuditLogs";
import { Footer } from "@/src/components/landing/Footer";
import { getDashboardData } from "@/src/actions/dashboard-actions"; // ✨ Import ang dashboard action

export const metadata = {
  title: "Dashboard | Paupahan Admin",
  description: "Buod ng mga aktibidad, kita, at paupahan.",
};

export default async function DashboardPage() {
  // ✨ Kunin ang totoong data mula sa database sa pamamagitan ng Server Action
  const { adminName, stats, auditLogs, chartData, pendingReadings, recentActivities } = await getDashboardData();

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Header Component - Ipinapasa ang tunay na pangalan ng naka-login */}
      <DashboardHeader adminName={adminName} />

      {/* 1. Stat Summary Section - Ipinapasa ang real database stats kung tatanggapin ng StatCards mo */}
      <section aria-label="Quick Statistics">
        <StatCards stats={stats} />
      </section>

      {/* 2. Main Analytics & Activity Grid */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Analytics & Approvals Area */}
        <div className="space-y-6 lg:col-span-2">
          <RevenueChart data={chartData} />
          <PendingApprovals readings={pendingReadings} />
        </div>

        {/* Notifications & Audit Logs Sidebar */}
        <div className="space-y-6">
          <RecentActivities activities={recentActivities} />
          {/* ✨ Ipinapasa ang mga aktwal na audit logs mula sa DB */}
          <AdminAuditLogs logs={auditLogs} />
        </div>
      </section>
      <Footer showNavLinks={false} />
    </div>
  );
}