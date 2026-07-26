/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useTransition } from "react";
import { MaintenanceTicket } from "@/src/types/tenant/tenant-maintenance";
import { MaintenanceHeader } from "@/src/components/tenant/maintenance/MaintenanceHeader";
import { TicketCard } from "@/src/components/tenant/maintenance/TicketCard";
import { NewTicketModal } from "@/src/components/tenant/maintenance/NewTicketModal";
import { Footer } from "@/src/components/landing/Footer";
import { getTenantMaintenanceTickets, createMaintenanceTicketAction } from "@/src/actions/tenant/tenant-maintenance-actions";
import FullPageLoader from "@/src/components/ui/FullPageLoader";

const ITEMS_PER_PAGE = 6; // 👈 Ginawa naming 6 para sakto sa 3 columns (2 rows) bawat pahina

export default function TenantMaintenancePage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // ✨ State para sa Pagination
  const [currentPage, setCurrentPage] = useState(1);

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

  // 🧮 Calculations para sa Pagination
  const totalPages = Math.ceil(tickets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTickets = tickets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return <FullPageLoader message="Nag-a-load ng mga maintenance report..." />;
  }

  return (
    <div className={`space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto ${isPending ? 'opacity-75 transition-opacity' : ''}`}>
      {/* 1. Header */}
      <MaintenanceHeader />

      {/* 2. Top Action Banner */}
      <div className="flex flex-col gap-3 rounded-3xl bg-forest/10 p-5 border border-forest/25 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div>
          <h2 className="font-display text-sm font-bold text-forest-deep sm:text-base">
            May sirang ilaw, tubo, o gamit sa iyong kwarto?
          </h2>
          <p className="text-xs text-muted mt-0.5">
            I-submit agad ang litrato at detalye para magawan ng action ng landlord.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 rounded-2xl bg-forest px-4 py-3 font-mono-brand text-xs font-bold text-white shadow-md hover:bg-forest-deep transition-all hover:scale-105 active:scale-95"
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
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-paper-card p-12 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest/10 text-forest mb-3">
              {/* SVG Icon para sa Walang Ticket */}
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="font-display text-base font-bold text-forest-deep">
              Walang Nakitang Maintenance Report
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted">
              Wala ka pa ring na-isusumiteng maintenance report sa ngayon. Pindutin ang &quot;Mag-report ng Sira&quot; sa itaas kung may kailangan kang ipaayos.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* ✨ 3-Columns Grid layout para sa Ticket Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>

            {/* 🎈 Playful Pagination Controls (Lalabas lang kapag higit sa ITEMS_PER_PAGE ang tickets) */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-line bg-paper-card p-4 shadow-sm transition-all hover:shadow-md">
                {/* Counter Indicator */}
                <div className="flex items-center gap-2 font-mono-brand text-xs font-semibold text-muted">
                  <span className="flex h-6 items-center rounded-lg bg-forest/10 px-2.5 text-forest font-bold">
                    🛠️ Pahina {currentPage} ng {totalPages}
                  </span>
                  <span className="text-muted/40">•</span>
                  <span>({tickets.length} kabuuang ulat)</span>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-1.5">
                  {/* Previous Button (SVG Chevron Left) */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-paper text-forest transition-all hover:scale-110 hover:border-forest active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-xs"
                    title="Nakaraang pahina"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Page Number Badges */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`h-9 min-w-9 px-2 rounded-xl font-mono-brand text-xs font-bold transition-all hover:scale-110 active:scale-95 ${
                          currentPage === page
                            ? "bg-forest text-white shadow-md ring-2 ring-forest/30 scale-105"
                            : "border border-line bg-paper text-forest hover:bg-forest/10"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  {/* Next Button (SVG Chevron Right) */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-paper text-forest transition-all hover:scale-110 hover:border-forest active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-xs"
                    title="Susunod na pahina"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
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