/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { MaintenanceRequest, PriorityLevel, MaintenanceStatus } from "@/src/types/admin/maintenance";

interface MaintenanceCardsProps {
  requests: MaintenanceRequest[];
  onUpdateStatus: (id: string, newStatus: MaintenanceStatus, expenses?: number, adminRemark?: string) => void;
}

// Minimalist Options Configuration (Katulad sa Add Unit Modal)
const STATUS_OPTIONS: { label: string; value: MaintenanceStatus; description: string; color: string }[] = [
  {
    label: "Pending",
    value: "Pending",
    description: "Nakahinto o naghihintay ng aksyon",
    color: "bg-amber-50 text-amber-800 border-amber-200/80",
  },
  {
    label: "In Progress",
    value: "In Progress",
    description: "Kasalukuyang inaayos o ginagawan ng paraan",
    color: "bg-blue-50 text-blue-700 border-blue-200/80",
  },
  {
    label: "Mark as Resolved",
    value: "Resolved",
    description: "Tapos na at naayos na ang ulat ng sira",
    color: "bg-forest/10 text-forest border-forest/20",
  },
];

export function MaintenanceCards({ requests, onUpdateStatus }: MaintenanceCardsProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Pagination State - Nakatakda sa 3 items bawat pahina
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; 
  
  // States para sa pag-handle ng status changes, expenses, at admin remarks per request ID
  const [statusInput, setStatusInput] = useState<{ [key: string]: MaintenanceStatus }>({});
  const [expensesInput, setExpensesInput] = useState<{ [key: string]: string }>({});
  const [remarkInput, setRemarkInput] = useState<{ [key: string]: string }>({});

  // State para sa nakabukas na custom dropdown per request ID
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown kapag nag-click sa labas
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case "Emergency":
        return "bg-coral-deep text-white font-semibold border-transparent";
      case "High":
        return "bg-coral/15 text-coral-deep border-coral/20 font-semibold";
      case "Medium":
        return "bg-marigold/15 text-forest-deep border-marigold/20 font-semibold";
      case "Low":
        return "bg-paper text-muted border-line/60 font-medium";
    }
  };

  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case "Resolved":
        return "bg-forest/10 text-forest border-forest/20";
      case "In Progress":
        return "bg-blue-50/80 text-blue-700 border-blue-200/60";
      case "Pending":
        return "bg-amber-50/80 text-amber-800 border-amber-200/60";
    }
  };

  const getCategoryIcon = (category: MaintenanceRequest["category"]) => {
    switch (category) {
      case "Plumbing":
        return (
          <svg className="h-4 w-4 shrink-0 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case "Electrical":
        return (
          <svg className="h-4 w-4 shrink-0 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case "Appliance":
        return (
          <svg className="h-4 w-4 shrink-0 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        );
      case "Structural":
        return (
          <svg className="h-4 w-4 shrink-0 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4 shrink-0 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756.2924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRequests = requests.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-5" ref={dropdownRef}>
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted font-mono-brand">
            Mga Nakatalang Ulat
          </h2>
          <span className="flex h-5 items-center justify-center rounded-full bg-paper border border-line px-2 text-[10px] font-bold text-forest-deep font-mono-brand">
            {requests.length}
          </span>
        </div>

        {totalPages > 1 && (
          <span className="text-[11px] font-medium text-muted font-mono-brand">
            {currentPage} / {totalPages}
          </span>
        )}
      </div>

      {/* Empty State */}
      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2.5 rounded-3xl border border-dashed border-line bg-paper-card/40 py-12 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-paper border border-line/80">
            <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs font-medium text-muted">Walang natagpuang maintenance request sa kategoryang ito.</p>
        </div>
      ) : (
        /* Cards Grid */
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {currentRequests.map((req) => {
            const currentSelectedStatus = statusInput[req.id] || req.status;
            const isResolved = currentSelectedStatus === "Resolved";
            const reqExpenses = (req as any).expenses;
            const adminRemark = (req as any).adminRemark;
            const isDropdownOpen = openDropdownId === req.id;
            const activeOption = STATUS_OPTIONS.find((opt) => opt.value === currentSelectedStatus) || STATUS_OPTIONS[0];

            return (
              <div
                key={req.id}
                className="group flex flex-col justify-between rounded-3xl border border-line/80 bg-paper-card p-5 transition-all duration-200 hover:border-line hover:shadow-xs"
              >
                {/* Upper Content */}
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 border-b border-line/50 pb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-paper border border-line/60">
                        {getCategoryIcon(req.category)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-tight block truncate font-mono-brand">
                          {req.ticketNumber} • {req.dateReported}
                        </span>
                        <h3 className="font-bold text-forest-deep text-sm tracking-tight truncate">
                          {req.unitName} - {req.roomNumber}
                        </h3>
                        <p className="text-[11px] text-muted truncate mt-0.5">
                          {req.tenantName}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-mono-brand ${getPriorityBadge(
                        req.priority
                      )}`}
                    >
                      {req.priority}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h4 className="font-semibold text-forest-deep text-sm leading-snug">
                      {req.issueTitle}
                    </h4>
                    <p className="text-xs leading-relaxed text-muted line-clamp-3">
                      {req.description}
                    </p>
                  </div>

                  {/* Image Attachment Preview */}
                  {req.imageUrl && (
                    <div className="pt-1">
                      <div 
                        onClick={() => setSelectedImage(req.imageUrl ?? null)}
                        className="group/img relative h-36 w-full cursor-pointer overflow-hidden rounded-2xl border border-line bg-paper transition-all hover:border-forest/30"
                      >
                        <Image
                          src={req.imageUrl}
                          alt={req.issueTitle}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover/img:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity duration-200 group-hover/img:opacity-100 flex items-center justify-center backdrop-blur-[1px]">
                          <span className="rounded-full bg-black/70 px-3 py-1 text-[10px] font-semibold text-white font-mono-brand">
                            I-click para palakihin
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Update & Actions */}
                <div className="mt-5 border-t border-line/50 pt-3.5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider font-mono-brand">Status:</span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold font-mono-brand ${getStatusBadge(
                        req.status
                      )}`}
                    >
                      {req.status}
                    </span>
                  </div>

                  {/* Resolved Info Display */}
                  {req.status === "Resolved" && reqExpenses !== undefined && reqExpenses > 0 && (
                    <div className="flex items-center justify-between rounded-2xl bg-forest/5 border border-forest/15 px-3.5 py-2 text-xs font-mono-brand">
                      <span className="text-muted font-medium">Gastos:</span>
                      <span className="font-bold text-forest">₱{Number(reqExpenses).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  {req.status === "Resolved" && adminRemark && (
                    <div className="rounded-2xl bg-paper border border-line/70 px-3.5 py-2.5 text-xs space-y-0.5">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-wider block font-mono-brand">Admin Remark:</span>
                      <p className="text-forest-deep italic leading-relaxed">{adminRemark}</p>
                    </div>
                  )}

                  {/* Update Controls */}
                  {req.status !== "Resolved" ? (
                    <div className="space-y-2.5 pt-1">
                      {/* Modern Custom Dropdown (Pareho sa Add Unit UI) */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenDropdownId(isDropdownOpen ? null : req.id)}
                          className="flex w-full items-center justify-between rounded-2xl border border-line bg-paper px-3.5 py-2.5 text-left font-mono-brand text-xs font-semibold text-forest-deep transition-all hover:border-forest/40 focus:border-forest focus:ring-1 focus:ring-forest cursor-pointer shadow-2xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`inline-block h-2 w-2 rounded-full ${
                              activeOption.value === "Resolved" ? "bg-forest" : activeOption.value === "In Progress" ? "bg-blue-600" : "bg-amber-600"
                            }`} />
                            <span>{activeOption.label}</span>
                          </div>
                          <svg
                            className={`h-4 w-4 text-muted transition-transform duration-200 ${
                              isDropdownOpen ? "rotate-180 text-forest" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Dropdown Options Popup */}
                        {isDropdownOpen && (
                          <div className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-2xl border border-line bg-paper-card p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                            <div className="space-y-1">
                              {STATUS_OPTIONS.map((option) => {
                                const isSelected = option.value === currentSelectedStatus;
                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                      setStatusInput((prev) => ({ ...prev, [req.id]: option.value }));
                                      setOpenDropdownId(null);
                                    }}
                                    className={`flex w-full items-start justify-between rounded-xl p-2.5 text-left transition-all cursor-pointer ${
                                      isSelected
                                        ? "bg-paper border border-line/80 shadow-2xs"
                                        : "hover:bg-paper/60"
                                    }`}
                                  >
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-2 font-mono-brand text-xs font-bold text-forest-deep">
                                        <span>{option.label}</span>
                                        <span className={`rounded-full border px-1.5 py-0.2 text-[9px] ${option.color}`}>
                                          {option.value}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-muted">{option.description}</p>
                                    </div>
                                    {isSelected && (
                                      <svg className="h-4 w-4 text-forest shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Inputs kapag Mark as Resolved */}
                      {isResolved && (
                        <div className="space-y-2 rounded-2xl border border-line/60 bg-paper/50 p-3 animate-in fade-in duration-150">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted font-mono-brand">
                              Gastos (Expenses)
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-muted font-mono-brand">₱</span>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={expensesInput[req.id] ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setExpensesInput(prev => ({ ...prev, [req.id]: val }));
                                }}
                                className="w-full rounded-xl border border-line bg-paper py-1.5 pl-7 pr-3 font-mono-brand text-xs font-semibold text-forest-deep outline-none focus:border-forest focus:ring-1 focus:ring-forest"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted font-mono-brand">
                              Admin Remark
                            </label>
                            <textarea
                              rows={2}
                              placeholder="Mag-iwan ng komento..."
                              value={remarkInput[req.id] ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRemarkInput(prev => ({ ...prev, [req.id]: val }));
                              }}
                              className="w-full rounded-xl border border-line bg-paper p-2 text-xs text-forest-deep outline-none focus:border-forest focus:ring-1 focus:ring-forest resize-none placeholder:text-muted/60"
                            />
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
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
                        className="w-full rounded-xl bg-forest py-2 text-center font-mono-brand text-xs font-semibold text-white transition-all hover:bg-forest-deep active:scale-[0.99] cursor-pointer shadow-xs"
                      >
                        I-save ang Pagbabago
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 rounded-xl border border-forest/15 bg-forest/5 py-2 text-center font-mono-brand text-[11px] font-semibold text-forest">
                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Tapos na ang request na ito</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-line/60">
          <span className="text-xs text-muted font-mono-brand">
            Pinapakita: <span className="font-semibold text-forest-deep">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, requests.length)}</span> / <span className="font-semibold text-forest-deep">{requests.length}</span>
          </span>

          <div className="flex items-center gap-1 bg-paper-card border border-line rounded-full p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-full font-mono-brand text-xs font-semibold text-muted hover:text-forest-deep disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              ← Prev
            </button>

            <div className="flex items-center gap-1 px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`h-6 w-6 rounded-full font-mono-brand text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                    currentPage === page
                      ? "bg-forest text-white"
                      : "text-muted hover:text-forest-deep"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-full font-mono-brand text-xs font-semibold text-muted hover:text-forest-deep disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-xs"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85vh] max-w-[85vw] overflow-hidden rounded-3xl bg-paper-card p-2 border border-line"
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-slate-900/60 p-2 text-white hover:bg-slate-900 transition-all cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative h-[75vh] w-[75vw]">
              <Image
                src={selectedImage}
                alt="Maintenance Issue Full View"
                fill
                className="object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}