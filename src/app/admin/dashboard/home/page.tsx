import { DashboardHeader } from "@/src/components/admin/dashboard/DashboardHeader";
import { StatCards } from "@/src/components/admin/dashboard/StatCards";
import { RevenueChart } from "@/src/components/admin/dashboard/RevenueChart";
import { RoomsSummaryChart } from "@/src/components/admin/dashboard/RoomsSummaryChart"; // 👈 I-import ang bagong component
import { Footer } from "@/src/components/landing/Footer";
import { getDashboardData, getRevenueChartData } from "@/src/actions/dashboard-actions";

export const metadata = {
  title: "Dashboard | Paupahan Admin",
  description: "Buod ng mga aktibidad, kita, at paupahan.",
};

export default async function DashboardPage() {
  const { adminName, stats, chartData, roomsSummary } = await getDashboardData(); // 👈 Kunin ang roomsSummary mula sa actions

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <DashboardHeader adminName={adminName} />

      <section aria-label="Quick Statistics">
        <StatCards stats={stats} />
      </section>

      {/* 👇 Ang bagong Rooms Summary component */}
      <section aria-label="Rooms Summary">
        <RoomsSummaryChart data={roomsSummary} />
      </section>

      {/* Malawak na Revenue Chart nang walang siksikang sidebar */}
      <section className="w-full">
        <RevenueChart data={chartData} onFilterChange={getRevenueChartData} />
      </section>

      <Footer showNavLinks={false} />
    </div>
  );
}