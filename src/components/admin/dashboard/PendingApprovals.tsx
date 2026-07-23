"use client";

import { PendingReading } from "@/src/types/admin/dashboard";
import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

interface PendingApprovalsProps {
  readings?: PendingReading[];
  onAction?: (id: string, actionType: "approve" | "reject") => Promise<void>;
}

export function PendingApprovals({ readings = [], onAction }: PendingApprovalsProps) {
  const [items, setItems] = useState<PendingReading[]>(readings);
  const [isPending, startTransition] = useTransition();
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // ✨ State para sa paglaki ng litrato
  const router = useRouter();

  useEffect(() => {
    setItems(readings);
  }, [readings]);

  const handleAction = async (id: string, actionType: "approve" | "reject") => {
    setItems((prev) => prev.filter((item) => item.id !== id));

    startTransition(async () => {
      try {
        if (onAction) {
          await onAction(id, actionType);
        }
        router.refresh();
      } catch (error) {
        console.error("Error processing approval:", error);
        setItems(readings);
      }
    });
  };

  const getTypeBadge = (type: PendingReading["type"]) => {
    switch (type) {
      case "water": return "bg-blue-100 text-blue-700 border-blue-200";
      case "electricity": return "bg-amber-100 text-amber-700 border-amber-200";
      case "rent": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "amenities": return "bg-purple-100 text-purple-700 border-purple-200";
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-paper-card p-4 sm:p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-line pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest/10 text-forest shrink-0">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-display text-base sm:text-lg font-bold text-forest-deep">
            Aprubahang Readings & Bayad
          </h3>
        </div>
        <span className="shrink-0 rounded-full bg-marigold/20 px-2.5 py-0.5 font-mono-brand text-[11px] sm:text-xs font-bold text-forest-deep">
          {items.length} Pending
        </span>
      </div>

      {/* List */}
      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3.5 rounded-xl border border-line/60 bg-paper/50 p-3.5 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-paper"
            >
              <div className="flex items-start gap-3">
                {/* ✨ Thumbnail ng Litrato ng Metro */}
                {item.proofPhotoUrl ? (
                  <div 
                    onClick={() => setSelectedImage(item.proofPhotoUrl || null)}
                    className="relative h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-line bg-black/5 hover:opacity-90 transition-opacity"
                  >
                    <img 
                      src={item.proofPhotoUrl} 
                      alt="Metro Reading" 
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-[9px] font-bold text-white bg-black/60 px-1 rounded">Tingnan</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-line bg-muted/10 text-muted text-[10px]">
                    Walang Litrato
                  </div>
                )}

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

                  <div className="flex items-center gap-1.5 text-[10px] text-muted font-mono-brand pt-0.5">
                    <svg className="h-3.5 w-3.5 shrink-0 text-muted/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{item.dateSubmitted}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-line/40 sm:flex sm:items-center sm:pt-0 sm:border-0 shrink-0">
                <button 
                  disabled={isPending}
                  onClick={() => handleAction(item.id, "reject")}
                  className="w-full sm:w-auto rounded-lg border border-line px-3 py-2 text-xs font-bold text-coral-deep transition-all hover:bg-coral/10 active:scale-95 disabled:opacity-50"
                >
                  Tanggihan
                </button>
                <button 
                  disabled={isPending}
                  onClick={() => handleAction(item.id, "approve")}
                  className="w-full sm:w-auto rounded-lg bg-forest px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-forest-deep active:scale-95 disabled:opacity-50"
                >
                  Aprubahan
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="py-6 text-center text-xs text-muted">Walang naghihintay na aprubahan sa ngayon.</p>
        )}
      </div>

      {/* ✨ Image Preview Modal (Pag-click sa litrato para lumaki) */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative max-w-2xl w-full bg-paper rounded-2xl overflow-hidden shadow-2xl p-4 border border-line">
            <div className="flex justify-between items-center pb-3 border-b border-line mb-3">
              <h4 className="font-bold text-forest-deep text-sm">Litrato ng Metro ng Tenant</h4>
              <button 
                onClick={() => setSelectedImage(null)}
                className="rounded-lg p-1 text-muted hover:bg-muted/10 font-bold text-xs"
              >
                ✕ Isara
              </button>
            </div>
            <div className="flex justify-center bg-black/5 rounded-xl overflow-hidden max-h-[70vh]">
              <img src={selectedImage} alt="Full Meter Reading" className="object-contain max-h-[65vh]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}