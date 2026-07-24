import { RecentActivities } from "@/src/components/admin/dashboard/RecentActivities";
import { Footer } from "@/src/components/landing/Footer";
import { getDashboardData } from "@/src/actions/dashboard-actions";

export const metadata = {
  title: "Dashboard | Paupahan Admin",
  description: "Buod ng mga aktibidad, kita, at paupahan.",
};

export default async function DashboardPage() {
  const { recentActivities } = await getDashboardData();
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <RecentActivities activities={recentActivities} />
      <Footer showNavLinks={false} />
    </div>
  );
}