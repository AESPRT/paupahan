"use client";

import { useState, useEffect, useTransition } from "react";
import { MaintenanceHeader } from "@/src/components/admin/maintenance/MaintenanceHeader";
import { MaintenanceCards } from "@/src/components/admin/maintenance/MaintenanceCards";
import { MaintenanceRequest, MaintenanceStatus } from "@/src/types/admin/maintenance";
import { Footer } from "@/src/components/landing/Footer";
import { getAdminMaintenanceRequests, updateMaintenanceStatusAction } from "@/src/actions/admin-maintenance";
import FullPageLoader from "@/src/components/ui/FullPageLoader";

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();

  // Kunin ang mga request mula sa database pag-load ng page
  useEffect(() => {
    async function fetchRequests() {
      setIsLoading(true);
      const res = await getAdminMaintenanceRequests();
      if (res.success && res.requests) {
        setRequests(res.requests as MaintenanceRequest[]);
      }
      setIsLoading(false);
    }
    fetchRequests();
  }, []);

  // Update Status Handler (Admin/Landlord Action) gamit ang Server Action
  const handleUpdateStatus = (
    id: string, 
    newStatus: MaintenanceStatus, 
    expenses?: number, 
    adminRemark?: string
  ) => {
    // I-optimistic update ang UI agad kasama ang expenses at adminRemark para mabilis mag-reflect
    setRequests((prev) =>
      prev.map((req) => 
        req.id === id 
          ? { ...req, status: newStatus, expenses: expenses ?? req.expenses, adminRemark: adminRemark ?? req.adminRemark } 
          : req
      )
    );

    startTransition(async () => {
      // Ipasa ang expenses at adminRemark papunta sa server action
      const res = await updateMaintenanceStatusAction(id, newStatus, adminRemark, expenses);
      if (!res.success) {
        alert(res.error);
        // I-revert o i-refetch kung nagka-error
        const refreshed = await getAdminMaintenanceRequests();
        if (refreshed.success && refreshed.requests) {
          setRequests(refreshed.requests as MaintenanceRequest[]);
        }
      }
    });
  };

  // Calculations for Admin Stats
  const totalPending = requests.filter((r) => r.status === "Pending").length;
  const totalInProgress = requests.filter((r) => r.status === "In Progress").length;
  const totalResolved = requests.filter((r) => r.status === "Resolved").length;

  const filteredRequests =
    filterStatus === "All"
      ? requests
      : requests.filter((r) => r.status === filterStatus);

  // FullPageLoader sa pinakataas bago i-render ang buong layout
  if (isLoading) {
    return <FullPageLoader message="Kinukuha ang mga maintenance requests..." />;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Admin Header Overview */}
      <MaintenanceHeader
        totalPending={totalPending}
        totalInProgress={totalInProgress}
        totalResolved={totalResolved}
      />

      {/* Modern Minimalist Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
        {[
          { label: "Lahat ng Requests", value: "All" },
          { label: "Pending", value: "Pending" },
          { label: "In Progress", value: "In Progress" },
          { label: "Resolved", value: "Resolved" },
        ].map((tab) => {
          const isActive = filterStatus === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilterStatus(tab.value)}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Maintenance Cards */}
      <MaintenanceCards
        requests={filteredRequests}
        onUpdateStatus={handleUpdateStatus}
      />

      <Footer showNavLinks={false} />
    </div>
  );
}