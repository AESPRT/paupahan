/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { Invoice } from "@/src/types/admin/billing";
import Image from "next/image";
import { 
  Search, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  ExternalLink,
  Zap,
  Droplets
} from "lucide-react";

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

  // ✨ State para sa pagbubukas ng resibo modal ng tenant
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [selectedReceiptMeta, setSelectedReceiptMeta] = useState<{ tenantName: string; invoiceNumber: string } | null>(null);

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
        const hasPaymentSubmitted = inv.paymentDetails != null;
        return matchesSearch && hasPaymentSubmitted && inv.status !== "Paid" && inv.status !== "Overdue";
      }
      
      return matchesSearch;
    });
  }, [invoices, searchQuery, selectedStatus]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  
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

        {/* Search & Filter Controls */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Hanapin ang tenant o unit..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full sm:w-60 rounded-xl border border-line bg-paper-card py-2 pl-9 pr-4 font-mono-brand text-xs text-ink placeholder:text-muted/60 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest shadow-sm"
            />
          </div>

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
          <div className="mb-3 rounded-2xl bg-forest/5 p-4 text-forest">
            <FileText className="w-8 h-8" />
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
              const hasPaymentSubmitted = inv.paymentDetails != null;

              // Hanapin kung may utility items (kuryente / tubig) sa bill items
              const electricityItem = inv.lineItems?.find((item: any) => item.type === 'electricity' || item.description?.toLowerCase().includes('kuryente') || item.description?.toLowerCase().includes('electricity'));
              const waterItem = inv.lineItems?.find((item: any) => item.type === 'water' || item.description?.toLowerCase().includes('tubig') || item.description?.toLowerCase().includes('water'));

              return (
                <div
                  key={inv.id}
                  className="perforated relative flex flex-col justify-between rounded-2xl border border-line bg-paper-card p-5 pb-6 shadow-[0_8px_24px_rgba(27,58,52,0.08)] transition-all hover:-translate-y-1 overflow-hidden"
                >
                  {/* ✨ Malaki at Mas Mababang Transparency na Watermark Stamp sa Gitna */}
                  {isPaid && (
                    <div className="stamp-anim pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                      <div className="rotate-[-14deg] rounded-3xl border-[5px] border-coral/35 bg-transparent px-8 py-3 font-display text-[34px] font-black tracking-widest text-coral/35 shadow-none select-none">
                        BAYAD NA!
                      </div>
                    </div>
                  )}

                  {isOverdue && (
                    <div className="stamp-anim pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                      <div className="rotate-[-14deg] rounded-3xl border-[5px] border-coral-deep/35 bg-transparent px-8 py-3 font-display text-[34px] font-black tracking-widest text-coral-deep/35 shadow-none select-none">
                        OVERDUE!
                      </div>
                    </div>
                  )}

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

                    {/* UTILITY READINGS BREAKDOWN (Kuryente at Tubig) */}
                    {(electricityItem || waterItem) && (
                      <div className="mt-3 rounded-xl bg-forest/5 p-3 border border-forest/10 space-y-2.5">
                        <div className="font-mono-brand text-[10px] font-bold text-forest-deep uppercase tracking-wider flex items-center gap-1.5 border-b border-forest/10 pb-1.5">
                          <span>Submeter Readings Breakdown</span>
                        </div>

                        {/* Kuryente Breakdown */}
                        {electricityItem && (
                          <div className="space-y-1 font-mono-brand text-[11px]">
                            <div className="flex items-center justify-between font-bold text-ink">
                              <span className="flex items-center gap-1 text-amber-600">
                                <Zap className="w-3.5 h-3.5" /> Kuryente ({electricityItem.unitLabel || 'kWh'}):
                              </span>
                              <span className="text-forest-deep font-extrabold">
                                {Number(electricityItem.consumed || (Number(electricityItem.currentReading || 0) - Number(electricityItem.previousReading || 0))).toLocaleString()} {electricityItem.unitLabel || 'kWh'} consumed
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10.5px] text-muted bg-paper p-1.5 rounded-lg border border-line/40">
                              <div>Prev: <span className="text-ink font-bold">{Number(electricityItem.previousReading || 0).toLocaleString()}</span></div>
                              <div className="text-right">Curr: <span className="text-ink font-bold">{Number(electricityItem.currentReading || 0).toLocaleString()}</span></div>
                            </div>
                          </div>
                        )}

                        {/* Tubig Breakdown */}
                        {waterItem && (
                          <div className="space-y-1 font-mono-brand text-[11px] pt-1">
                            <div className="flex items-center justify-between font-bold text-ink">
                              <span className="flex items-center gap-1 text-sky-600">
                                <Droplets className="w-3.5 h-3.5" /> Tubig ({waterItem.unitLabel || 'm³'}):
                              </span>
                              <span className="text-forest-deep font-extrabold">
                                {Number(waterItem.consumed || (Number(waterItem.currentReading || 0) - Number(waterItem.previousReading || 0))).toLocaleString()} {waterItem.unitLabel || 'm³'} consumed
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10.5px] text-muted bg-paper p-1.5 rounded-lg border border-line/40">
                              <div>Prev: <span className="text-ink font-bold">{Number(waterItem.previousReading || 0).toLocaleString()}</span></div>
                              <div className="text-right">Curr: <span className="text-ink font-bold">{Number(waterItem.currentReading || 0).toLocaleString()}</span></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Total Amount */}
                    <div className="mt-3.5 flex items-center justify-between border-t-[1.5px] border-dashed border-line pt-3 font-mono-brand font-semibold">
                      <span className="text-xs text-muted uppercase">Kabuuan</span>
                      <span className="text-[19px] font-extrabold text-forest-deep sm:text-[21px]">
                        ₱{inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Payment Details with Lucide Icons */}
                    {inv.paymentDetails && (
                      <div className="mt-3 rounded-xl bg-forest/5 p-3 border border-forest/15 space-y-2 font-mono-brand text-[11px]">
                        <div className="font-bold text-forest-deep flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-forest" />
                            Isinumiteng Bayad:
                          </span>
                          <span className="uppercase bg-forest/10 px-2 py-0.5 rounded text-forest font-extrabold">
                            {inv.paymentDetails.method}
                          </span>
                        </div>
                        
                        {inv.paymentDetails.referenceNo && (
                          <div className="text-muted">
                            Reference No: <span className="text-ink font-bold">{inv.paymentDetails.referenceNo}</span>
                          </div>
                        )}

                        {/* Resibo Thumbnail na nagti-trigger ng Modal */}
                        {(() => {
                          const activeReceiptUrl = 
                            inv.paymentDetails.receiptUrl || 
                            inv.paymentDetails.paymentReceiptUrl || 
                            inv.paymentDetails.receipt;

                          if (!activeReceiptUrl) return null;

                          return (
                            <div className="space-y-1 pt-1 border-t border-forest/10">
                              <span className="text-muted block">Larawan ng Resibo / Proof:</span>
                              <div 
                                onClick={() => {
                                  setSelectedReceiptUrl(activeReceiptUrl);
                                  setSelectedReceiptMeta({ tenantName: inv.tenantName, invoiceNumber: inv.invoiceNumber });
                                }}
                                className="relative group rounded-xl overflow-hidden border border-line bg-paper h-32 w-full flex items-center justify-center cursor-pointer transition-all hover:border-forest"
                              >
                                <Image 
                                  src={activeReceiptUrl} 
                                  alt="Payment Proof" 
                                  fill
                                  sizes="(max-width: 768px) 100vw, 33vw"
                                  className="object-cover rounded-lg transition-transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white font-bold text-xs z-10">
                                  Tignan nang Buo <ExternalLink className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>

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
                        
                        {hasPaymentSubmitted ? (
                          <button
                            onClick={() => onMarkAsPaid(inv.id)}
                            className="rounded-xl bg-forest py-2 font-mono-brand text-[11px] font-bold text-white shadow-sm hover:bg-forest-deep active:scale-95 transition-all"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <div className="flex items-center justify-center rounded-xl bg-line/30 py-2 px-1 font-mono-brand text-[10px] font-bold text-muted text-center leading-tight">
                            Naghihintay ng Bayad
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 text-center font-mono-brand text-[11px] font-bold text-forest">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Kumpleto na ang bayad</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
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
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> Nakaraan
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
                Susunod <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* ✨ MODERN MINIMALIST RECEIPT PREVIEW MODAL */}
      {selectedReceiptUrl && (
        <div 
          onClick={() => setSelectedReceiptUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative w-full max-w-2xl rounded-3xl border border-line/80 bg-paper-card p-5 sm:p-6 shadow-2xl flex flex-col space-y-4 animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-forest animate-pulse" />
                  <h4 className="font-display text-sm font-bold text-forest-deep tracking-wide">
                    Patunay ng Pagbabayad (Payment Proof)
                  </h4>
                </div>
                {selectedReceiptMeta && (
                  <p className="font-mono-brand text-[11px] text-muted">
                    Tenant: <span className="text-ink font-bold">{selectedReceiptMeta.tenantName}</span> • Resibo: <span className="text-ink font-bold">{selectedReceiptMeta.invoiceNumber}</span>
                  </p>
                )}
              </div>
              <button 
                onClick={() => setSelectedReceiptUrl(null)}
                className="group flex h-8 w-8 items-center justify-center rounded-full bg-paper text-muted hover:bg-coral/10 hover:text-coral-deep transition-all border border-line/60"
                title="Isara"
              >
                <ArrowLeft className="w-4 h-4 rotate-180 transition-transform group-hover:rotate-90" />
              </button>
            </div>
            
            {/* Image Container with Full Preview */}
            <div className="relative w-full h-[65vh] bg-forest-deep/5 rounded-2xl overflow-hidden border border-line/40 flex items-center justify-center">
              <Image 
                src={selectedReceiptUrl} 
                alt="Full Payment Proof Preview" 
                fill
                sizes="(max-width: 1024px) 100vw, 700px"
                className="object-contain p-2" 
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-1 border-t border-line/50">
              <span className="font-mono-brand text-[10px] text-muted">
                I-click sa labas ng kahon para isara.
              </span>
              <a
                href={selectedReceiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-forest/10 px-3.5 py-2 font-mono-brand text-xs font-bold text-forest hover:bg-forest hover:text-white transition-all"
              >
                <span>Buksan sa Bagong Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}