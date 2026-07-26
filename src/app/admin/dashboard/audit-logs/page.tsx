/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { AdminAuditLogs } from "@/src/components/admin/dashboard/AdminAuditLogs";
import { Footer } from "@/src/components/landing/Footer";
import { getDashboardData } from "@/src/actions/dashboard-actions";
import FullPageLoader from "@/src/components/ui/FullPageLoader";

export default function DashboardPage() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getDashboardData();
        setAuditLogs(data.auditLogs || []);
      } catch (error) {
        console.error("Nabigong i-load ang audit logs:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <FullPageLoader message="Nag-a-load ng audit logs..." />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminAuditLogs logs={auditLogs} />
      <Footer showNavLinks={false} />
    </div>
  );
}