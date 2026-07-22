"use client";

import { useState } from "react";
import { TenantBill } from "@/src/types/tenant-bill";
import { TenantBillsPageHeader } from "@/src/components/tenant/bills/TenantBillsPageHeader";
import { BillCardItem } from "@/src/components/tenant/bills/BillCardItem";
import { BillDetailModal } from "@/src/components/tenant/bills/BillDetailModal";
import { Footer } from "@/src/components/landing/Footer";

const INITIAL_BILLS: TenantBill[] = [
  {
    id: "INV-2026-07",
    monthYear: "Hulyo 2026",
    dueDate: "Hulyo 31, 2026",
    status: "Draft Pending Readings",
    rentAmount: 5000.0,
    amenitiesFee: 350.0,
    electricity: {
      type: "electricity",
      previousReading: 1240,
      ratePerUnit: 12.5,
      unitLabel: "kWh",
      status: "Pending Tenant Input",
    },
    water: {
      type: "water",
      previousReading: 310,
      ratePerUnit: 45.0,
      unitLabel: "m³",
      status: "Pending Tenant Input",
    },
    totalAmount: 5350.0, // Base amount
  },
  {
    id: "INV-2026-06",
    monthYear: "Hunyo 2026",
    dueDate: "Hunyo 30, 2026",
    status: "Paid",
    rentAmount: 5000.0,
    amenitiesFee: 350.0,
    electricity: {
      type: "electricity",
      previousReading: 1160,
      currentReading: 1240,
      ratePerUnit: 12.5,
      unitLabel: "kWh",
      status: "Approved",
    },
    water: {
      type: "water",
      previousReading: 295,
      currentReading: 310,
      ratePerUnit: 45.0,
      unitLabel: "m³",
      status: "Approved",
    },
    totalAmount: 7025.0,
    paidAt: "Hunyo 28, 2026",
  },
];

export default function TenantBillsPage() {
  const [bills, setBills] = useState<TenantBill[]>(INITIAL_BILLS);
  const [selectedBill, setSelectedBill] = useState<TenantBill | null>(null);

  // Function para sa pag-update ng meter reading at status
  const handleUpdateUtility = (
    billId: string,
    utilityType: "electricity" | "water",
    reading: number,
    photoUrl: string
  ) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id !== billId) return b;

        const updated = { ...b };
        if (utilityType === "electricity") {
          updated.electricity = {
            ...updated.electricity,
            currentReading: reading,
            proofPhotoUrl: photoUrl,
            status: "Pending Landlord Approval",
          };
        } else {
          updated.water = {
            ...updated.water,
            currentReading: reading,
            proofPhotoUrl: photoUrl,
            status: "Pending Landlord Approval",
          };
        }

        return updated;
      })
    );

    // I-update ang aktibong napiling bill para mag-reflect agad sa modal
    if (selectedBill && selectedBill.id === billId) {
      setSelectedBill((prev) => {
        if (!prev) return null;
        const updated = { ...prev };
        if (utilityType === "electricity") {
          updated.electricity = {
            ...updated.electricity,
            currentReading: reading,
            proofPhotoUrl: photoUrl,
            status: "Pending Landlord Approval",
          };
        } else {
          updated.water = {
            ...updated.water,
            currentReading: reading,
            proofPhotoUrl: photoUrl,
            status: "Pending Landlord Approval",
          };
        }
        return updated;
      });
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <TenantBillsPageHeader />

      {/* Bills Cards List */}
      <div className="space-y-3">
        {bills.map((bill) => (
          <BillCardItem
            key={bill.id}
            bill={bill}
            onOpenDetails={setSelectedBill}
          />
        ))}
      </div>

      {/* Bill Details Modal */}
      <BillDetailModal
        bill={selectedBill}
        isOpen={!!selectedBill}
        onClose={() => setSelectedBill(null)}
        onUpdateUtility={handleUpdateUtility}
      />

      <Footer showNavLinks = {false} />
    </div>
  );
}