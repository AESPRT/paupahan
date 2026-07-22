"use client";

import { useState } from "react";
import { MaintenanceTicket } from "@/src/types/tenant-maintenance";
import { MOCK_MAINTENANCE_TICKETS } from "@/src/data/tenant-maintenance";
import { MaintenanceHeader } from "@/src/components/tenant/maintenance/MaintenanceHeader";
import { TicketCard } from "@/src/components/tenant/maintenance/TicketCard";
import { NewTicketModal } from "@/src/components/tenant/maintenance/NewTicketModal";
import { Footer } from "@/src/components/landing/Footer";

export default function TenantMaintenancePage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(MOCK_MAINTENANCE_TICKETS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function kapag nag-submit si Tenant ng bagong report
  const handleCreateTicket = (
    newTicketData: Omit<MaintenanceTicket, "id" | "createdAt" | "status">
  ) => {
    const newTicket: MaintenanceTicket = {
      ...newTicketData,
      id: `MNT-2026-00${tickets.length + 1}`,
      createdAt: "Ngayon",
      status: "Pending",
    };

    setTickets([newTicket, ...tickets]);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* 1. Header */}
      <MaintenanceHeader />

      {/* 2. Top Action Banner */}
      <div className="flex flex-col gap-3 rounded-3xl bg-forest/10 p-5 border border-forest/20 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-sm font-bold text-forest-deep sm:text-base">
            May sirang ilaw, tubo, o gamit sa iyong kwarto?
          </h2>
          <p className="text-xs text-muted">
            I-submit agad ang litrato at detalye para magawan ng action ng landlord.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 rounded-2xl bg-forest px-4 py-3 font-mono-brand text-xs font-bold text-white shadow-md hover:bg-forest-deep transition-transform active:scale-95"
        >
          + Mag-report ng Sira
        </button>
      </div>

      {/* 3. Ticket List Section */}
      <section className="space-y-3">
        <h2 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
          Aking mga Na-report na Maintenance ({tickets.length})
        </h2>

        {tickets.length === 0 ? (
          <div className="rounded-3xl border border-line bg-paper-card p-8 text-center text-xs text-muted">
            Wala ka pang na-isusumiteng maintenance report.
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </section>

      <Footer showNavLinks = {false} />

      {/* 4. New Ticket Submission Modal */}
      <NewTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
}