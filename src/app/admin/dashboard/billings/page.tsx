"use client";

import { useState } from "react";
import { BillingsHeader } from "@/src/components/admin/billings/BillingsHeader";
import { CreateInvoiceModal } from "@/src/components/admin/billings/CreateInvoiceModal";
import { InvoicesList } from "@/src/components/admin/billings/InvoicesList";
import { Invoice } from "@/src/types/admin/billing";
import { Footer } from "@/src/components/landing/Footer";

const INITIAL_INVOICES: Invoice[] = [
  {
    id: "inv-101",
    invoiceNumber: "INV-2026-001",
    tenantName: "Juan Dela Cruz",
    unitRoom: "Unit 102 - Room A",
    issueDate: "2026-07-01",
    dueDate: "2026-07-05",
    lineItems: [
      { description: "Buwanang Renta", amount: 6500 },
      { description: "Sub-meter Kuryente", amount: 1420 },
    ],
    totalAmount: 7920,
    status: "Paid",
  },
  {
    id: "inv-102",
    invoiceNumber: "INV-2026-002",
    tenantName: "Maria Clara",
    unitRoom: "Unit 201 - Room C",
    issueDate: "2026-07-01",
    dueDate: "2026-08-05",
    lineItems: [
      { description: "Buwanang Renta", amount: 7500 },
      { description: "Tubig & Internet", amount: 680 },
    ],
    totalAmount: 8180,
    status: "Pending",
  },
  {
    id: "inv-103",
    invoiceNumber: "INV-2026-003",
    tenantName: "Pedro Penduko",
    unitRoom: "Unit 101 - Room B",
    issueDate: "2026-06-01",
    dueDate: "2026-06-05",
    lineItems: [{ description: "Buwanang Renta", amount: 6500 }],
    totalAmount: 6500,
    status: "Overdue",
  },
];

export default function BillingsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Handlers
  const handleCreateInvoice = (
    newInvoiceData: Omit<Invoice, "id" | "invoiceNumber">
  ) => {
    const newInvoice: Invoice = {
      ...newInvoiceData,
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${String(invoices.length + 1).padStart(3, "0")}`,
    };

    setInvoices((prev) => [newInvoice, ...prev]);
  };

  const handleMarkAsPaid = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "Paid" } : inv))
    );
  };

  const handleSendReminder = (invoice: Invoice) => {
    alert(`Nagpadala ng billing reminder kay ${invoice.tenantName} para sa ${invoice.invoiceNumber}`);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header & Financial Metrics */}
      <BillingsHeader
        totalCollected={totalCollected}
        totalPending={totalPending}
        totalOverdue={totalOverdue}
        onCreateInvoice={() => setIsModalOpen(true)}
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
      />

      <Footer showNavLinks = {false} />
    </div>
  );
}