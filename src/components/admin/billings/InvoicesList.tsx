/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { Invoice } from "@/src/types/admin/billing";
import Image from "next/image";

interface InvoicesListProps {
  invoices: Invoice[];
  onMarkAsPaid: (id: string) => void;
  onSendReminder: (invoice: Invoice) => void;
}

export function InvoicesList({
  invoices,
  onMarkAsPaid,
  onSendReminder,
}: InvoicesListProps) {
  // State para sa Search at Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // State para sa pagination (limit na 3 bawat pahina)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // I-filter ang mga invoices batay sa search query at status filter
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv: any) => {
      const matchesSearch =
        inv.tenantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.unitRoom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase());

      if (selectedStatus === "All") return matchesSearch;
      if (selectedStatus === "Paid") return matchesSearch && inv.status === "Paid";
      if (selectedStatus === "Overdue") return matchesSearch && inv.status === "Overdue";
      if (selectedStatus === "Pending") {
        const hasPaymentSubmitted = inv.paymentDetails != null || inv.status === "Pending";
        return matchesSearch && hasPaymentSubmitted && inv.status !== "Paid" && inv.status !== "Overdue";
      }
      return matchesSearch;
    });
  }, [invoices, searchQuery, selectedStatus]);

  // Kalkulahin ang pagination mula sa na-filter na listahan
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  
  // I-reset sa page 1 kapag nagbago ang search o filter
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-mono-brand text-xs font-bold uppercase tracking-wider text-muted">
          Mga Inilabas na Resibo at Invoice ({filteredInvoices.length})
        </h2>

        {/* Playful Search & Filter Controls */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Search Input na may SVG Icon */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted pointer-events-none">
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Hanapin ang tenant o unit..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full sm:w-60 rounded-xl border border-line bg-paper-card py-2 pl-9 pr-4 font-mono-brand text-xs text-ink placeholder:text-muted/60 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest shadow-sm"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {["All", "Paid", "Pending", "Overdue"].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`rounded-xl px-3 py-2 font-mono-brand text-[11px] font-bold transition-all ${
                  selectedStatus === status
                    ? "bg-forest text-white shadow-sm"
                    : "border border-line bg-paper-card text-muted hover:bg-line/30 hover:text-ink"
                }`}
              >
                {status === "All" ? "Lahat" : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-paper-card p-12 text-center shadow-sm">
          {/* Empty State SVG Icon */}
          <div className="mb-3 rounded-2xl bg-forest/5 p-4 text-forest">
            <svg 
              className="w-8 h-8" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="1.5" 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>
          <h3 className="font-display text-base font-bold text-forest-deep">
            Walang Nakitang Invoice
          </h3>
          <p className="mt-1 max-w-sm text-xs text-muted">
            Walang tumutugma sa iyong hinahanap o naka-filter na kategorya.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {currentInvoices.map((inv: any) => {
              const isPaid = inv.status === "Paid";
              const isOverdue = inv.status === "Overdue";
              const hasPaymentSubmitted = inv.paymentDetails != null || inv.status === "Pending";

              return (
                <div
                  key={inv.id}
                  className="perforated relative flex flex-col justify-between rounded-2xl border border-line bg-paper-card p-5 pb-6 shadow-[0_8px_24px_rgba(27,58,52,0.08)] transition-all hover:-translate-y-1"
                >
                  <div>
                    <div className="mb-3.5 flex items-start justify-between border-b-[1.5px] border-dashed border-line pb-3.5">
                      <div>
                        <div className="font-mono-brand text-[10px] font-bold tracking-wide text-muted">
                          RESIBO NG BAYARIN • {inv.invoiceNumber}
                        </div>
                        <div className="mt-1 font-display text-[15px] font-bold text-forest-deep">
                          {inv.unitRoom}
                        </div>
                        <div className="flex items-center gap-1.5 text-[12px] font-medium text-muted mt-0.5">
                          <span>{inv.tenantName}</span>
                        </div>
                      </div>
                      <div className="font-mono-brand text-[10px] font-bold text-muted text-right">
                        <span>Due:</span>
                        <span className="block text-ink">{inv.dueDate}</span>
                      </div>
                    </div>

                    {/* Line Items */}
                    <div className="space-y-1.5 py-1">
                      {inv.lineItems.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex justify-between font-mono-brand text-[12.5px] text-ink"
                        >
                          <span className="text-muted">{item.description}</span>
                          <span className="font-semibold">
                            ₱{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total Amount */}
                    <div className="mt-3.5 flex items-center justify-between border-t-[1.5px] border-dashed border-line pt-3 font-mono-brand font-semibold">
                      <span className="text-xs text-muted uppercase">Kabuuan</span>
                      <span className="text-[19px] font-extrabold text-forest-deep sm:text-[21px]">
                        ₱{inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* GCash Payment Details gamit ang next/image */}
                    {inv.paymentDetails && (
                      <div className="mt-3 rounded-xl bg-forest/5 p-3 border border-forest/15 space-y-2 font-mono-brand text-[11px]">
                        <div className="font-bold text-forest-deep flex items-center justify-between">
                          <span>💳 Isinumiteng Bayad:</span>
                          <span className="uppercase bg-forest/10 px-2 py-0.5 rounded text-forest font-extrabold">
                            {inv.paymentDetails.method}
                          </span>
                        </div>
                        
                        {inv.paymentDetails.referenceNo && (
                          <div className="text-muted">
                            Reference No: <span className="text-ink font-bold">{inv.paymentDetails.referenceNo}</span>
                          </div>
                        )}

                        {inv.paymentDetails.receiptUrl && (
                          <div className="space-y-1 pt-1 border-t border-forest/10">
                            <span className="text-muted block">Larawan ng Resibo / Proof:</span>
                            <div className="relative group rounded-lg overflow-hidden border border-line bg-paper h-32 w-full flex items-center justify-center">
                              <Image 
                                src={inv.paymentDetails.receiptUrl} 
                                alt="GCash Payment Proof" 
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className="object-cover rounded-md transition-transform group-hover:scale-105"
                              />
                              <a 
                                href={inv.paymentDetails.receiptUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs z-10"
                              >
                                Tignan nang Buo ↗
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status Stamps */}
                  {isPaid && (
                    <div className="stamp-anim pointer-events-none absolute right-[10px] top-[35%] rotate-[-8deg] rounded-[10px] border-[3px] border-coral bg-paper-card/95 px-3 py-1 font-display text-[16px] font-extrabold tracking-wide text-coral shadow-sm">
                      BAYAD NA!
                    </div>
                  )}

                  {isOverdue && (
                    <div className="stamp-anim pointer-events-none absolute right-[10px] top-[35%] rotate-[6deg] rounded-[10px] border-[3px] border-coral bg-paper-card/95 px-3 py-1 font-display text-[15px] font-extrabold tracking-wide text-coral-deep shadow-sm">
                      OVERDUE!
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-5 border-t border-line/60 pt-3">
                    {!isPaid ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onSendReminder(inv)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-paper py-2 font-mono-brand text-[11px] font-bold text-forest-deep hover:bg-line/40"
                        >
                          I-remind
                        </button>
                        
                        <button
                          disabled={!hasPaymentSubmitted}
                          onClick={() => onMarkAsPaid(inv.id)}
                          className={`rounded-xl py-2 font-mono-brand text-[11px] font-bold shadow-sm transition-all ${
                            !hasPaymentSubmitted
                              ? "bg-line/60 text-muted cursor-not-allowed shadow-none" 
                              : "bg-forest text-white hover:bg-forest-deep active:scale-95"
                          }`}
                        >
                          {!hasPaymentSubmitted ? "Naghihintay ng Bayad" : "Mark Paid"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 text-center font-mono-brand text-[11px] font-bold text-forest">
                        <span>Kumpleto na ang bayad</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Playful Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between rounded-2xl border border-line bg-paper-card px-6 py-4 shadow-sm">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`group flex items-center gap-2 rounded-xl px-4 py-2 font-mono-brand text-xs font-bold transition-all ${
                  currentPage === 1
                    ? "cursor-not-allowed opacity-40 bg-line/20 text-muted"
                    : "bg-forest/10 text-forest hover:bg-forest hover:text-white active:scale-95"
                }`}
              >
                <span className="transition-transform group-hover:-translate-x-0.5">←</span> Nakaraan
              </button>

              <div className="flex items-center gap-2 font-mono-brand text-xs font-bold text-forest-deep">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest text-white shadow-sm">
                  {currentPage}
                </span>
                <span className="text-muted">ng</span>
                <span className="rounded-lg bg-line/40 px-2 py-1 text-ink">{totalPages}</span>
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`group flex items-center gap-2 rounded-xl px-4 py-2 font-mono-brand text-xs font-bold transition-all ${
                  currentPage === totalPages
                    ? "cursor-not-allowed opacity-40 bg-line/20 text-muted"
                    : "bg-forest/10 text-forest hover:bg-forest hover:text-white active:scale-95"
                }`}
              >
                Susunod <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}