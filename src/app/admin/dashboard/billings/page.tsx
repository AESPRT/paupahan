"use client";

import { useState, useEffect, useTransition } from "react";
import { BillingsHeader } from "@/src/components/admin/billings/BillingsHeader";
import { CreateInvoiceModal } from "@/src/components/admin/billings/CreateInvoiceModal";
import { InvoicesList } from "@/src/components/admin/billings/InvoicesList";
import { Invoice } from "@/src/types/admin/billing";
import { Footer } from "@/src/components/landing/Footer";
import { 
  getBillingsData, 
  getOccupiedRoomsForBilling, 
  createInvoiceAction, 
  markInvoiceAsPaidAction 
} from "@/src/actions/billings-actions";

export default function BillingsPage() {
  interface ActiveTenantRoom {
    roomId: string;
    roomNumber: string;
    unitName: string;
    tenantName: string;
    monthlyRent: number;
  }

  // Sa loob ng BillingsPage component:
  const [occupiedRooms, setOccupiedRooms] = useState<ActiveTenantRoom[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Load data mula sa database kapag binuksan ang pahina
  useEffect(() => {
    getBillingsData().then((data) => {
      setInvoices(data.invoices as Invoice[]);
      setLoading(false);
    });
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
        // Refresh data para makuha ang bagong listahan galing database
        const data = await getBillingsData();
        setInvoices(data.invoices as Invoice[]);
        setIsModalOpen(false);
      } else {
        alert(result.error);
      }
    });
  };

  const handleMarkAsPaid = async (id: string) => {
    // Optimistic UI update para mabilis magbago sa screen
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "Paid" } : inv))
    );

    startTransition(async () => {
      const result = await markInvoiceAsPaidAction(id);
      if (!result.success) {
        alert(result.error);
        // Refresh para ibalik sa tamang data kung nagka-error
        const data = await getBillingsData();
        setInvoices(data.invoices as Invoice[]);
      }
    });
  };

  const handleSendReminder = (invoice: Invoice) => {
    alert(`Nagpadala ng billing reminder kay ${invoice.tenantName} para sa ${invoice.invoiceNumber}`);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <span className="text-sm font-medium text-muted">Nag-a-load ng billings at invoices...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 p-4 sm:p-6 lg:p-8 ${isPending ? 'opacity-75 transition-opacity' : ''}`}>
      {/* Header & Financial Metrics */}
      <BillingsHeader
        totalCollected={totalCollected}
        totalPending={totalPending}
        totalOverdue={totalOverdue}
        onCreateInvoice={handleOpenModal} // 👈 Ginamit ang handleOpenModal para ma-fetch muna ang rooms bago buksan ang modal
      />

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
        roomsWithTenants={occupiedRooms} // 👈 Ipinasa ang listahan ng occupied rooms papuntang modal
      />

      <Footer showNavLinks={false} />
    </div>
  );
}