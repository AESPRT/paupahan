"use client";

import { useState, useEffect, useTransition } from "react";
import { MaintenanceHeader } from "@/src/components/admin/maintenance/MaintenanceHeader";
import { MaintenanceCards } from "@/src/components/admin/maintenance/MaintenanceCards";
import { MaintenanceRequest, MaintenanceStatus } from "@/src/types/admin/maintenance";
import { Footer } from "@/src/components/landing/Footer";
import { getAdminMaintenanceRequests, updateMaintenanceStatusAction } from "@/src/actions/admin-maintenance";

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
  const handleUpdateStatus = (id: string, newStatus: MaintenanceStatus) => {
    // I-optimistic update ang UI agad para mabilis ang reaksyon
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );

    startTransition(async () => {
      const res = await updateMaintenanceStatusAction(id, newStatus);
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

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Admin Header Overview */}
      <MaintenanceHeader
        totalPending={totalPending}
        totalInProgress={totalInProgress}
        totalResolved={totalResolved}
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-line pb-3 overflow-x-auto">
        {["All", "Pending", "In Progress", "Resolved"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`rounded-xl px-4 py-2 font-mono-brand text-xs font-bold transition-all whitespace-nowrap ${
              filterStatus === tab
                ? "bg-forest text-white shadow-sm"
                : "border border-line bg-paper text-muted hover:bg-line/40"
            }`}
          >
            {tab === "All" ? "Lahat ng Requests" : tab}
          </button>
        ))}
      </div>

      {/* Loading o Requests Cards */}
      {isLoading ? (
        <div className="py-20 text-center font-mono-brand text-sm text-muted">
          Kinukuha ang mga maintenance requests...
        </div>
      ) : (
        <MaintenanceCards
          requests={filteredRequests}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      <Footer showNavLinks={false} />
    </div>
  );
}