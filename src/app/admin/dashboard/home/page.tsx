/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/src/components/admin/dashboard/DashboardHeader";
import { StatCards } from "@/src/components/admin/dashboard/StatCards";
import { RevenueChart } from "@/src/components/admin/dashboard/RevenueChart";
import { RoomsSummaryChart } from "@/src/components/admin/dashboard/RoomsSummaryChart";
import { Footer } from "@/src/components/landing/Footer";
import { getDashboardData, getRevenueChartData } from "@/src/actions/dashboard-actions";
import FullPageLoader from "@/src/components/ui/FullPageLoader";

// 1. Linawin ang exact shape ng stats state para maiwasan ang unrendered values
interface DashboardStats {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  reservedUnits: number;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  reservedRooms: number;
  monthlyRevenue: number;
  pendingBillsAmount: number;
  occupancyRate: number;
}

const DEFAULT_STATS: DashboardStats = {
  totalProperties: 0,
  totalUnits: 0,
  occupiedUnits: 0,
  vacantUnits: 0,
  reservedUnits: 0,
  totalRooms: 0,
  occupiedRooms: 0,
  vacantRooms: 0,
  reservedRooms: 0,
  monthlyRevenue: 0,
  pendingBillsAmount: 0,
  occupancyRate: 0,
};

export default function DashboardPage() {
  const [adminName, setAdminName] = useState("");
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [chartData, setChartData] = useState<any[]>([]);
  const [roomsSummary, setRoomsSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDashboardData();
        setAdminName(data?.adminName || "");
        
        // 2. I-merge ang server response sa default object para laging may numbers
        setStats({
          ...DEFAULT_STATS,
          ...(data?.stats || {}),
        });
        
        setChartData(data?.chartData || []);
        setRoomsSummary(data?.roomsSummary || null);
      } catch (error) {
        console.error("Nabigong i-load ang dashboard data:", error);
        setStats(DEFAULT_STATS);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <FullPageLoader message="Nag-a-load ng dashboard..." />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <DashboardHeader adminName={adminName} />

      {/* Siguradong valid numbers na ang papasok sa StatCards */}
      <section aria-label="Quick Statistics">
        <StatCards stats={stats} />
      </section>

      {/* Rooms Summary component */}
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