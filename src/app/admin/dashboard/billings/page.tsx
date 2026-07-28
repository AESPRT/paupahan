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
  markInvoiceAsPaidAction,
  sendBillingReminderAction 
} from "@/src/actions/billings-actions";
import { getDashboardData, handleApprovalAction } from "@/src/actions/dashboard-actions";
import FullPageLoader from "@/src/components/ui/FullPageLoader";

export default function BillingsPage() {
  interface ActiveTenantRoom {
    leaseId: string;
    roomId?: string | null;
    unitId?: string | null;
    roomNumber: string;
    unitName: string;
    tenantName: string;
    monthlyRent: number;
    amenities: {
      id: string;
      name: string;
      amount: number;
      frequency: string;
    }[];
  }

  const [occupiedRooms, setOccupiedRooms] = useState<ActiveTenantRoom[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pendingReadings, setPendingReadings] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

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

  const handleOpenModal = async () => {
    const result = await getOccupiedRoomsForBilling();
    if (result.success) {
      setOccupiedRooms(result.roomsWithTenants as ActiveTenantRoom[]);
    }
    setIsModalOpen(true);
  };

  // ✨ Kasama na rito ang 'payment_submitted' sa pagkuha ng totalCollected at totalPending
  const totalCollected = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const totalPending = invoices
    .filter((inv) => 
      inv.status === "Pending" || 
      (inv as any).paymentDetails != null
    )
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const totalOverdue = invoices
    .filter((inv) => inv.status === "Overdue")
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

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
    const reminderNote = prompt("Maglagay ng karagdagang mensahe o paalala (Opsyonal):") || "";

    startTransition(async () => {
      const result = await sendBillingReminderAction(invoice.id, invoice.tenantName, reminderNote);
      if (result.success) {
        alert(`Matagumpay na naipadala ang billing reminder kay ${invoice.tenantName}!`);
      } else {
        alert(result.error || "Nabigong magpadala ng reminder.");
      }
    });
  };

  const handleActionWrapper = async (id: string, actionType: "approve" | "reject") => {
    const res = await handleApprovalAction(id, actionType);
    if (!res.success) {
      throw new Error(res.error || "Nabigong iproseso ang aksyon.");
    }

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
      <BillingsHeader
        totalCollected={totalCollected}
        totalPending={totalPending}
        totalOverdue={totalOverdue}
        onCreateInvoice={handleOpenModal}
      />

      <PendingApprovals readings={pendingReadings} onAction={handleActionWrapper} />

      <InvoicesList
        invoices={invoices}
        onMarkAsPaid={handleMarkAsPaid}
        onSendReminder={handleSendReminder}
      />

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