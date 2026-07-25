/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useTransition } from "react";
import { BillingsHeader } from "@/src/components/admin/billings/BillingsHeader";
import { CreateInvoiceModal } from "@/src/components/admin/billings/CreateInvoiceModal";
import { InvoicesList } from "@/src/components/admin/billings/InvoicesList";
import { PendingApprovals } from "@/src/components/admin/dashboard/PendingApprovals";
import { Invoice } from "@/src/types/admin/billing";
import { Footer } from "@/src/components/landing/Footer";
import { 
  getBillingsData, 
  getOccupiedRoomsForBilling, 
  createInvoiceAction, 
  markInvoiceAsPaidAction 
} from "@/src/actions/billings-actions";
import { getDashboardData, handleApprovalAction } from "@/src/actions/dashboard-actions";
import FullPageLoader from "@/src/components/ui/FullPageLoader";

export default function BillingsPage() {
  interface ActiveTenantRoom {
    roomId: string;
    roomNumber: string;
    unitName: string;
    tenantName: string;
    monthlyRent: number;
  }

  const [occupiedRooms, setOccupiedRooms] = useState<ActiveTenantRoom[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pendingReadings, setPendingReadings] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Load data mula sa database kapag binuksan ang pahina gamit ang useEffect
  useEffect(() => {
    async function loadData() {
      try {
        const [billingsData, dashboardData] = await Promise.all([
          getBillingsData(),
          getDashboardData(),
        ]);
        setInvoices(billingsData.invoices as Invoice[]);
        setPendingReadings(dashboardData.pendingReadings || []);
      } catch (error) {
        console.error("Nabigong i-load ang billings data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Function para buksan ang modal at i-fetch ang mga occupied rooms
  const handleOpenModal = async () => {
    const result = await getOccupiedRoomsForBilling();
    if (result.success) {
      setOccupiedRooms(result.roomsWithTenants);
    }
    setIsModalOpen(true);
  };

  // Calculations for Summary Cards
  const totalCollected = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const totalPending = invoices
    .filter((inv) => inv.status === "Pending")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const totalOverdue = invoices
    .filter((inv) => inv.status === "Overdue")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  // Handlers (Dynamic with Server Actions)
  const handleCreateInvoice = async (newInvoiceData: Omit<Invoice, "id" | "invoiceNumber">) => {
    startTransition(async () => {
      const result = await createInvoiceAction(newInvoiceData);
      if (result.success) {
        const data = await getBillingsData();
        setInvoices(data.invoices as Invoice[]);
        setIsModalOpen(false);
      } else {
        alert(result.error);
      }
    });
  };

  const handleMarkAsPaid = async (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "Paid" } : inv))
    );

    startTransition(async () => {
      const result = await markInvoiceAsPaidAction(id);
      if (!result.success) {
        alert(result.error);
        const data = await getBillingsData();
        setInvoices(data.invoices as Invoice[]);
      }
    });
  };

  const handleSendReminder = (invoice: Invoice) => {
    alert(`Nagpadala ng billing reminder kay ${invoice.tenantName} para sa ${invoice.invoiceNumber}`);
  };

  // Wrapper function para sa pag-apruba/pag-reject ng pending readings
  const handleActionWrapper = async (id: string, actionType: "approve" | "reject") => {
    const res = await handleApprovalAction(id, actionType);
    if (!res.success) {
      throw new Error(res.error || "Nabigong iproseso ang aksyon.");
    }

    // ✨ Sabay na i-refresh ang pending readings AT ang invoices list para maging real-time
    startTransition(async () => {
      const [dashboardData, billingsData] = await Promise.all([
        getDashboardData(),
        getBillingsData(),
      ]);
      setPendingReadings(dashboardData.pendingReadings || []);
      setInvoices(billingsData.invoices as Invoice[]);
    });
  };

  if (loading) {
    return <FullPageLoader message="Nag-a-load ng billings at invoices..." />;
  }

  return (
    <div className={`space-y-6 p-4 sm:p-6 lg:p-8 ${isPending ? 'opacity-75 transition-opacity' : ''}`}>
      {/* Header & Financial Metrics */}
      <BillingsHeader
        totalCollected={totalCollected}
        totalPending={totalPending}
        totalOverdue={totalOverdue}
        onCreateInvoice={handleOpenModal}
      />

      {/* Pending Approvals Section */}
      <PendingApprovals readings={pendingReadings} onAction={handleActionWrapper} />

      {/* Invoices List */}
      <InvoicesList
        invoices={invoices}
        onMarkAsPaid={handleMarkAsPaid}
        onSendReminder={handleSendReminder}
      />

      {/* Modal for Creating New Invoices */}
      <CreateInvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateInvoice}
        roomsWithTenants={occupiedRooms}
      />

      <Footer showNavLinks={false} />
    </div>
  );
}