import { DashboardHeader } from "@/src/components/admin/dashboard/DashboardHeader";
import { StatCards } from "@/src/components/admin/dashboard/StatCards";
import { RevenueChart } from "@/src/components/admin/dashboard/RevenueChart";
import { PendingApprovals } from "@/src/components/admin/dashboard/PendingApprovals";
import { RecentActivities } from "@/src/components/admin/dashboard/RecentActivities";
import { AdminAuditLogs } from "@/src/components/admin/dashboard/AdminAuditLogs";
import { Footer } from "@/src/components/landing/Footer";
import { getDashboardData, handleApprovalAction } from "@/src/actions/dashboard-actions";

export const metadata = {
  title: "Dashboard | Paupahan Admin",
  description: "Buod ng mga aktibidad, kita, at paupahan.",
};

export default async function DashboardPage() {
  const { adminName, stats, auditLogs, chartData, pendingReadings, recentActivities } = await getDashboardData();

  // ✨ Wrapper function para magtugma ang return type sa Promise<void> na inaasahan ng component
  const handleActionWrapper = async (id: string, actionType: "approve" | "reject") => {
    "use server";
    const res = await handleApprovalAction(id, actionType);
    if (!res.success) {
      throw new Error(res.error || "Nabigong iproseso ang aksyon.");
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <DashboardHeader adminName={adminName} />

      <section aria-label="Quick Statistics">
        <StatCards stats={stats} />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <RevenueChart data={chartData} />
          {/* ✨ Gamitin ang wrapper function dito */}
          <PendingApprovals readings={pendingReadings} onAction={handleActionWrapper} />
        </div>

        <div className="space-y-6">
          <RecentActivities activities={recentActivities} />
          <AdminAuditLogs logs={auditLogs} />
        </div>
      </section>
      <Footer showNavLinks={false} />
    </div>
  );
}