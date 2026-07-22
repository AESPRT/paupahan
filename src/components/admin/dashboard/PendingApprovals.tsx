"use client";

import { PendingReading } from "@/src/types/dashboard";

const PENDING_READINGS: PendingReading[] = [
  { id: "1", tenantName: "Juan Dela Cruz", unitName: "Unit 102 - Room A", type: "water", readingOrAmount: "142 m³", dateSubmitted: "Ngayon, 10:15 AM" },
  { id: "2", tenantName: "Maria Clara", unitName: "Unit 201 - Room C", type: "electricity", readingOrAmount: "1,240 kWh", dateSubmitted: "Kahapon, 4:30 PM" },
  { id: "3", tenantName: "Pedro Penduko", unitName: "Unit 101 - Room B", type: "rent", readingOrAmount: "₱6,500", dateSubmitted: "Kahapon, 2:00 PM" },
  { id: "4", tenantName: "Ana Santos", unitName: "Unit 305", type: "amenities", readingOrAmount: "₱500 (Parking)", dateSubmitted: "July 20" },
];

export function PendingApprovals() {
  const getTypeBadge = (type: PendingReading["type"]) => {
    switch (type) {
      case "water": return "bg-blue-100 text-blue-700 border-blue-200";
      case "electricity": return "bg-amber-100 text-amber-700 border-amber-200";
      case "rent": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "amenities": return "bg-purple-100 text-purple-700 border-purple-200";
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-paper-card p-4 sm:p-5 shadow-sm">
      {/* Component Header */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-base sm:text-lg font-bold text-forest-deep flex items-center gap-2">
          <span>⏳</span> Aprubahang Readings & Bayad
        </h3>
        <span className="shrink-0 rounded-full bg-marigold/20 px-2.5 py-0.5 font-mono-brand text-[11px] sm:text-xs font-bold text-forest-deep">
          {PENDING_READINGS.length} Pending
        </span>
      </div>

      {/* Pending Items List */}
      <div className="mt-4 space-y-3">
        {PENDING_READINGS.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3.5 rounded-xl border border-line/60 bg-paper/50 p-3.5 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-paper"
          >
            {/* Left Info Area */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-md border px-2 py-0.5 font-mono-brand text-[10px] font-bold uppercase ${getTypeBadge(item.type)}`}>
                  {item.type}
                </span>
                <span className="font-bold text-forest-deep text-sm">{item.tenantName}</span>
              </div>

              <p className="text-xs text-muted">
                {item.unitName} • <span className="font-bold text-ink">{item.readingOrAmount}</span>
              </p>

              <span className="block text-[10px] text-muted font-mono-brand">
                📅 {item.dateSubmitted}
              </span>
            </div>

            {/* Right Action Buttons (Full width sa mobile, auto width sa desktop) */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-line/40 sm:flex sm:items-center sm:pt-0 sm:border-0 shrink-0">
              <button 
                onClick={() => alert(`Tinanggihan: ${item.tenantName}`)}
                className="w-full sm:w-auto rounded-lg border border-line px-3 py-2 text-xs font-bold text-coral-deep transition-all hover:bg-coral/10 active:scale-95"
              >
                Tanggihan
              </button>
              <button 
                onClick={() => alert(`Inaprubahan: ${item.tenantName}`)}
                className="w-full sm:w-auto rounded-lg bg-forest px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-forest-deep active:scale-95"
              >
                Aprubahan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}