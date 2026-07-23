"use client";

import { useState } from "react";
import { UtilitiesHeader } from "@/src/components/admin/utilities/UtilitiesHeader";
import { AssignBillModal } from "@/src/components/admin/utilities/AssignBillModal";
import { UtilityBillsList } from "@/src/components/admin/utilities/UtilityBillsList";
import { UtilityRate, RoomUtilityBill } from "@/src/types/admin/utility";
import { Footer } from "@/src/components/landing/Footer";

const INITIAL_RATES: UtilityRate[] = [
  { id: "r1", type: "electricity", name: "Kuryente", ratePerUnit: 14, unitLabel: "kWh" },
  { id: "r2", type: "water", name: "Tubig", ratePerUnit: 35, unitLabel: "m³" },
  { id: "r3", type: "internet", name: "WiFi", ratePerUnit: 300, unitLabel: "Flat / Room" },
  { id: "r4", type: "amenities", name: "Trash / Maint.", ratePerUnit: 150, unitLabel: "Flat / Month" },
];

const INITIAL_BILLS: RoomUtilityBill[] = [
  { id: "b1", unitName: "Building A", roomNumber: "Room 101", tenantName: "Juan Dela Cruz", type: "electricity", totalAmount: 1420, dueDate: "2026-08-05", status: "Pending" },
  { id: "b2", unitName: "Building A", roomNumber: "Room 102", tenantName: "Maria Clara", type: "water", totalAmount: 380, dueDate: "2026-08-05", status: "Paid" },
  { id: "b3", unitName: "Building B", roomNumber: "Room 201", tenantName: "Pedro Penduko", type: "internet", totalAmount: 300, dueDate: "2026-08-01", status: "Overdue" },
];

export default function UtilitiesPage() {
  const [rates, setRates] = useState<UtilityRate[]>(INITIAL_RATES);
  const [bills, setBills] = useState<RoomUtilityBill[]>(INITIAL_BILLS);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Update Rate Handler
  const handleUpdateRate = (id: string, newRate: number) => {
    setRates((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ratePerUnit: newRate } : r))
    );
  };

  // Add Bill Handler
  const handleAssignBill = (newBill: Omit<RoomUtilityBill, "id">) => {
    setBills((prev) => [
      { ...newBill, id: `b-${Date.now()}` },
      ...prev,
    ]);
  };

  // Mark as Paid
  const handleMarkAsPaid = (id: string) => {
    setBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "Paid" } : b))
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header & Global Rates */}
      <UtilitiesHeader
        rates={rates}
        onUpdateRate={handleUpdateRate}
        onAssignBill={() => setIsAssignModalOpen(true)}
      />

      {/* Utility Bills List */}
      <UtilityBillsList bills={bills} onMarkAsPaid={handleMarkAsPaid} />

      {/* Assign Bill Modal */}
      <AssignBillModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssignBill}
      />

      <Footer showNavLinks = {false} />
    </div>
  );
}