/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Image from "next/image";
import { MaintenanceRequest, PriorityLevel, MaintenanceStatus } from "@/src/types/admin/maintenance";

interface MaintenanceCardsProps {
  requests: MaintenanceRequest[];
  onUpdateStatus: (id: string, newStatus: MaintenanceStatus, expenses?: number, adminRemark?: string) => void;
}

export function MaintenanceCards({ requests, onUpdateStatus }: MaintenanceCardsProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // States para sa pag-handle ng status changes, expenses, at admin remarks per request ID
  const [statusInput, setStatusInput] = useState<{ [key: string]: MaintenanceStatus }>({});
  const [expensesInput, setExpensesInput] = useState<{ [key: string]: string }>({});
  const [remarkInput, setRemarkInput] = useState<{ [key: string]: string }>({});

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case "Emergency":
        return "bg-coral-deep text-white font-bold border-coral-deep";
      case "High":
        return "bg-coral/15 text-coral-deep border-coral/30 font-bold";
      case "Medium":
        return "bg-marigold/20 text-forest-deep border-marigold/30";
      case "Low":
        return "bg-paper text-muted border-line";
    }
  };

  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case "Resolved":
        return "bg-forest/10 text-forest border-forest/20";
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Pending":
        return "bg-amber-50 text-amber-800 border-amber-200";
    }
  };

  const getCategoryIcon = (category: MaintenanceRequest["category"]) => {
    switch (category) {
      case "Plumbing":
        return (
          <svg className="h-5 w-5 shrink-0 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case "Electrical":
        return (
          <svg className="h-5 w-5 shrink-0 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "Appliance":
        return (
          <svg className="h-5 w-5 shrink-0 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        );
      case "Structural":
        return (
          <svg className="h-5 w-5 shrink-0 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 shrink-0 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756.2924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-mono-brand text-xs font-bold uppercase tracking-wider text-muted">
        Mga Nakatalang Ulat ng Sira ({requests.length})
      </h2>

      {requests.length === 0 ? (
        <div className="flex items-center justify-center gap-2 rounded-3xl border border-dashed border-line bg-paper-card p-8 text-center text-xs text-muted">
          <svg className="h-4 w-4 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Walang natagpuang maintenance request sa kategoryang ito.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((req) => {
            const currentSelectedStatus = statusInput[req.id] || req.status;
            const isResolved = currentSelectedStatus === "Resolved";
            const reqExpenses = (req as any).expenses;
            const adminRemark = (req as any).adminRemark;

            return (
              <div
                key={req.id}
                className="flex flex-col justify-between rounded-3xl border border-line bg-paper-card p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between border-b border-line/60 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-paper border border-line/60">
                        {getCategoryIcon(req.category)}
                      </span>
                      <div>
                        <span className="font-mono-brand text-[10px] font-bold text-muted block">
                          {req.ticketNumber} • {req.dateReported}
                        </span>
                        <h3 className="font-bold text-forest-deep text-xs sm:text-sm">
                          {req.unitName} - {req.roomNumber}
                        </h3>
                        <div className="flex items-center gap-1 text-[11px] text-muted mt-0.5">
                          <svg className="h-3 w-3 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{req.tenantName}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`rounded-md border px-2 py-0.5 font-mono-brand text-[10px] ${getPriorityBadge(
                        req.priority
                      )}`}
                    >
                      {req.priority}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-3 space-y-1">
                    <h4 className="font-display font-bold text-forest-deep text-sm">
                      {req.issueTitle}
                    </h4>
                    <p className="text-xs leading-relaxed text-muted line-clamp-3">
                      {req.description}
                    </p>
                  </div>

                  {/* Image Attachment Preview */}
                  {req.imageUrl && (
                    <div className="mt-3">
                      <div 
                        onClick={() => setSelectedImage(req.imageUrl ?? null)}
                        className="group relative h-36 w-full cursor-pointer overflow-hidden rounded-2xl border border-line bg-paper"
                      >
                        <Image
                          src={req.imageUrl}
                          alt={req.issueTitle}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center z-10">
                          <span className="rounded-full bg-black/60 px-2.5 py-1 font-mono-brand text-[10px] font-bold text-white shadow-sm">
                            I-click para palakihin
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Update & Footer */}
                <div className="mt-5 border-t border-line/60 pt-3.5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono-brand text-[10px] text-muted uppercase">Status:</span>
                    <span
                      className={`rounded-md border px-2.5 py-0.5 font-mono-brand text-[10px] font-bold ${getStatusBadge(
                        req.status
                      )}`}
                    >
                      {req.status}
                    </span>
                  </div>

                  {/* Kung naka-Resolved na at may expenses, ipakita ito */}
                  {req.status === "Resolved" && reqExpenses !== undefined && reqExpenses > 0 && (
                    <div className="flex items-center justify-between rounded-xl bg-forest/5 border border-forest/15 px-3 py-2 text-xs font-mono-brand">
                      <span className="text-muted">Gastos (Expenses):</span>
                      <span className="font-bold text-forest">₱{Number(reqExpenses).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  {/* Kung naka-Resolved na at may admin remark, ipakita ito */}
                  {req.status === "Resolved" && adminRemark && (
                    <div className="rounded-xl bg-paper border border-line px-3 py-2 text-xs space-y-0.5">
                      <span className="font-mono-brand text-[10px] text-muted uppercase block">Admin Remark:</span>
                      <p className="text-forest-deep italic">{adminRemark}</p>
                    </div>
                  )}

                  {/* Quick Action Selector / Update Control */}
                  {req.status !== "Resolved" ? (
                    <div className="space-y-2.5">
                      <div className="relative">
                        <select
                          value={currentSelectedStatus}
                          onChange={(e) => {
                            const val = e.target.value as MaintenanceStatus;
                            setStatusInput(prev => ({ ...prev, [req.id]: val }));
                          }}
                          className="w-full appearance-none rounded-xl border border-line bg-paper px-3 py-2.5 pr-8 font-mono-brand text-xs font-bold text-forest-deep outline-none transition-all hover:border-forest/50 focus:border-forest focus:ring-1 focus:ring-forest shadow-2xs cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Mark as Resolved</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Input field para sa expenses kapag Resolved ang pinili */}
                      {isResolved && (
                        <>
                          <div className="space-y-1">
                            <label className="block font-mono-brand text-[10px] uppercase text-muted">
                              Magkano ang nagastos? (Expenses)
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 font-mono-brand text-xs font-bold text-muted">₱</span>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={expensesInput[req.id] ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setExpensesInput(prev => ({ ...prev, [req.id]: val }));
                                }}
                                className="w-full rounded-xl border border-line bg-paper py-2 pl-7 pr-3 font-mono-brand text-xs font-bold text-forest-deep outline-none focus:border-forest focus:ring-1 focus:ring-forest"
                              />
                            </div>
                          </div>

                          {/* Input field para sa Admin Remark */}
                          <div className="space-y-1">
                            <label className="block font-mono-brand text-[10px] uppercase text-muted">
                              Admin Remark (Opsyonal)
                            </label>
                            <textarea
                              rows={2}
                              placeholder="Mag-iwan ng komento o detalye..."
                              value={remarkInput[req.id] ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRemarkInput(prev => ({ ...prev, [req.id]: val }));
                              }}
                              className="w-full rounded-xl border border-line bg-paper p-2.5 font-sans text-xs text-forest-deep outline-none focus:border-forest focus:ring-1 focus:ring-forest resize-none"
                            />
                          </div>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          // Kumuha direkta mula sa state gamit ang exact req.id
                          const rawExpense = expensesInput[req.id];
                          const expenseVal = rawExpense && rawExpense.trim() !== "" ? parseFloat(rawExpense) : 0;
                          const remarkVal = remarkInput[req.id] ? remarkInput[req.id].trim() : "";
                          
                          onUpdateStatus(
                            req.id, 
                            currentSelectedStatus, 
                            isResolved ? expenseVal : undefined,
                            isResolved ? remarkVal : undefined
                          );
                        }}
                        className="w-full rounded-xl bg-forest py-2 text-center font-mono-brand text-xs font-bold text-white shadow-sm transition-all hover:bg-forest-deep"
                      >
                        I-save ang Pagbabago
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-forest/20 bg-forest/5 py-2 px-3 text-center font-mono-brand text-[11px] font-bold text-forest">
                      ✓ Tapos na ang request na ito
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
        >
          <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-paper-card p-2 shadow-2xl">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative h-[80vh] w-[80vw]">
              <Image
                src={selectedImage}
                alt="Maintenance Issue Full View"
                fill
                className="object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}