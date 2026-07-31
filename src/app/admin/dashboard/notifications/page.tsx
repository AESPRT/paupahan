/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { RecentActivities } from "@/src/components/admin/dashboard/RecentActivities";
import { NotificationsHeader } from "@/src/components/admin/dashboard/NotificationsHeader";
import { Footer } from "@/src/components/landing/Footer";
import { getDashboardData } from "@/src/actions/dashboard-actions";
import FullPageLoader from "@/src/components/ui/FullPageLoader";

export default function DashboardPage() {
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDashboardData();
        setRecentActivities(data.recentActivities || []);
      } catch (error) {
        console.error("Nabigong i-load ang dashboard activities:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <FullPageLoader message="Nag-a-load ng mga aktibidad..." />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <NotificationsHeader 
        totalActivities={recentActivities.length} 
        unreadCount={recentActivities.filter((a) => !a.isRead).length}
      />
      <RecentActivities activities={recentActivities} />
      <Footer showNavLinks={false} />
    </div>
  );
}