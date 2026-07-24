/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useTransition } from "react";
import { MaintenanceTicket } from "@/src/types/tenant/tenant-maintenance";
import { MaintenanceHeader } from "@/src/components/tenant/maintenance/MaintenanceHeader";
import { TicketCard } from "@/src/components/tenant/maintenance/TicketCard";
import { NewTicketModal } from "@/src/components/tenant/maintenance/NewTicketModal";
import { Footer } from "@/src/components/landing/Footer";
import { getTenantMaintenanceTickets, createMaintenanceTicketAction } from "@/src/actions/tenant/tenant-maintenance-actions";

export default function TenantMaintenancePage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Load ang mga tickets mula sa database sa simula
  useEffect(() => {
    async function loadTickets() {
      try {
        const result = await getTenantMaintenanceTickets();
        if (result.success) {
          setTickets(result.tickets as MaintenanceTicket[]);
        }
      } catch (error) {
        console.error("Nabigong i-load ang maintenance tickets:", error);
      } finally {
        setLoading(false);
      }
    }
    loadTickets();
  }, []);

  // Function kapag nag-submit si Tenant ng bagong report gamit ang Server Action
  const handleCreateTicket = (
    newTicketData: Omit<MaintenanceTicket, "id" | "createdAt" | "status">
  ) => {
    startTransition(async () => {
      const result = await createMaintenanceTicketAction({
        title: newTicketData.title,
        category: newTicketData.category.toLowerCase() as any,
        description: newTicketData.description,
        priority: newTicketData.priority.toLowerCase() as any,
        photoUrl: newTicketData.photoUrl,
      });

      if (result.success) {
        // I-refresh ang listahan pagkatapos mag-submit
        const updatedData = await getTenantMaintenanceTickets();
        if (updatedData.success) {
          setTickets(updatedData.tickets as MaintenanceTicket[]);
        }
        setIsModalOpen(false);
      } else {
        alert(result.error || "May naganap na problema.");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <span className="text-sm font-medium text-muted">Nag-a-load ng mga maintenance report...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 p-4 sm:p-6 lg:p-8 ${isPending ? 'opacity-75 transition-opacity' : ''}`}>
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

      <Footer showNavLinks={false} />

      {/* 4. New Ticket Submission Modal */}
      <NewTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
}