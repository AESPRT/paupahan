"use client";

import { useState } from "react";
import { MaintenanceHeader } from "@/src/components/admin/maintenance/MaintenanceHeader";
import { MaintenanceCards } from "@/src/components/admin/maintenance/MaintenanceCards";
import { MaintenanceRequest, MaintenanceStatus } from "@/src/types/maintenance";
import { Footer } from "@/src/components/landing/Footer";

const INITIAL_REQUESTS: MaintenanceRequest[] = [
  {
    id: "m1",
    ticketNumber: "TICK-101",
    unitName: "Building A",
    roomNumber: "Room 101",
    tenantName: "Juan Dela Cruz",
    category: "Plumbing",
    issueTitle: "Tumatagas na Banyo at Gripo",
    description: "Malakas po ang patak ng tubig sa ilalim ng lavatory sink sa banyo, kailangan po ng palit gasket.",
    priority: "High",
    status: "Pending",
    dateReported: "2026-07-21",
  },
  {
    id: "m2",
    ticketNumber: "TICK-102",
    unitName: "Building B",
    roomNumber: "Room 202",
    tenantName: "Maria Clara",
    category: "Electrical",
    issueTitle: "Pumutok na Outlet sa Kusina",
    description: "Hindi na gumagana ang dalawang saksakan pagkatapos gumamit ng microwave kahapon.",
    priority: "Emergency",
    status: "In Progress",
    dateReported: "2026-07-20",
  },
  {
    id: "m3",
    ticketNumber: "TICK-103",
    unitName: "Building A",
    roomNumber: "Room 103",
    tenantName: "Pedro Penduko",
    category: "Structural",
    issueTitle: "Loose Door Lock Handle",
    description: "Medyo maalon po ang doorknob sa main door ng kwarto.",
    priority: "Low",
    status: "Resolved",
    dateReported: "2026-07-15",
  },
];

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>(INITIAL_REQUESTS);
  const [filterStatus, setFilterStatus] = useState<string>("All");

  // Update Status Handler (Admin/Landlord Action)
  const handleUpdateStatus = (id: string, newStatus: MaintenanceStatus) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
    );
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

      {/* Requests Cards & Status Updater */}
      <MaintenanceCards
        requests={filteredRequests}
        onUpdateStatus={handleUpdateStatus}
      />

      <Footer showNavLinks = {false} />
    </div>
  );
}