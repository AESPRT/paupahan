import { AdminAuditLogs } from "@/src/components/admin/dashboard/AdminAuditLogs";
import { Footer } from "@/src/components/landing/Footer";
import { getDashboardData } from "@/src/actions/dashboard-actions";

export const metadata = {
  title: "Dashboard | Paupahan Admin",
  description: "Buod ng mga aktibidad, kita, at paupahan.",
};

export default async function DashboardPage() {
  const { auditLogs } = await getDashboardData();
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminAuditLogs logs={auditLogs} />
      <Footer showNavLinks={false} />
    </div>
  );
}