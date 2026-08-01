"use client";

import { PendingReading } from "@/src/types/admin/dashboard";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface PendingApprovalsProps {
  readings?: PendingReading[];
  onAction?: (id: string, actionType: "approve" | "reject") => Promise<void>;
}

export function PendingApprovals({ readings = [], onAction }: PendingApprovalsProps) {
  const [optimisticRemovals, setOptimisticRemovals] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  const items = readings.filter((item) => !optimisticRemovals.includes(item.id));

  const handleAction = async (id: string, actionType: "approve" | "reject") => {
    setOptimisticRemovals((prev) => [...prev, id]);

    startTransition(async () => {
      try {
        if (onAction) {
          await onAction(id, actionType);
        }
        router.refresh();
      } catch (error) {
        console.error("Error processing approval:", error);
        setOptimisticRemovals((prev) => prev.filter((itemId) => itemId !== id));
      }
    });
  };

  const getTypeBadge = (type: PendingReading["type"]) => {
    switch (type) {
      case "water": return "bg-blue-100 text-blue-700 border-blue-200/60";
      case "electricity": return "bg-amber-100 text-amber-700 border-amber-200/60";
      case "rent": return "bg-emerald-100 text-emerald-700 border-emerald-200/60";
      case "amenities": return "bg-purple-100 text-purple-700 border-purple-200/60";
    }
  };

  return (
    <div className="rounded-3xl border border-line bg-paper-card p-5 sm:p-7 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-forest/10 text-forest shrink-0">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-forest-deep">
              Mga Naghihintay na Aprubahan
            </h3>
            <p className="text-xs text-muted">Suriin at aprubahan ang mga isinumiteng submeter readings at bayarin.</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-marigold/20 px-3 py-1 font-mono-brand text-xs font-bold text-forest-deep">
          {items.length} Pending
        </span>
      </div>

      {/* Grid Layout (2 Columns) */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            // Kalkulahin o kunin ang mga detalye ng reading kung available (utility type)
            // Maaari mong i-adjust ang properties batay sa kung paano nakaimbak ang previous/consumed sa iyong PendingReading type
            const isUtility = item.type === "electricity" || item.type === "water";
            const unitLabel = item.type === "electricity" ? "kWh" : item.type === "water" ? "m³" : "";

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-line/80 bg-paper/60 p-4 sm:p-5 transition-all hover:bg-paper hover:border-forest/30 hover:shadow-md space-y-4"
              >
                {/* Taas: Tenant Info at Type Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-md border px-2 py-0.5 font-mono-brand text-[10px] font-bold uppercase ${getTypeBadge(item.type)}`}>
                        {item.type}
                      </span>
                      <span className="font-mono-brand text-[11px] text-muted">{item.unitName}</span>
                    </div>
                    <h4 className="font-display text-base font-bold text-forest-deep">
                      {item.tenantName}
                    </h4>
                  </div>

                  {/* Thumbnail ng Litrato ng Metro */}
                  {item.proofPhotoUrl ? (
                    <div 
                      onClick={() => setSelectedImage(item.proofPhotoUrl || null)}
                      className="relative h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-line bg-black/5 hover:opacity-90 transition-all shadow-xs"
                    >
                      <Image 
                        src={item.proofPhotoUrl} 
                        alt="Metro Reading Proof" 
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-bold text-white px-1 py-0.5">Tingnan</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-line bg-muted/10 text-muted text-[10px] text-center font-medium">
                      Walang Litrato
                    </div>
                  )}
                </div>

                {/* Gitna: Detalyadong Reading Breakdown (Kung Utility) o Kabuuang Halaga */}
                <div className="rounded-xl bg-paper p-3 border border-line/50 space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono-brand">
                    <span className="text-muted">Uri ng Bayarin:</span>
                    <span className="font-bold text-forest-deep">{item.readingOrAmount}</span>
                  </div>

                  {isUtility && (
                    <div className="grid grid-cols-3 gap-1 pt-2 border-t border-line/40 text-center font-mono-brand">
                    <div className="rounded-lg bg-paper-card p-1.5 border border-line/40">
                      <p className="text-[9px] uppercase text-muted">Nakaraan</p>
                      <p className="text-xs font-bold text-forest-deep">
                        {item.utilityDetails?.previousReading ?? "—"} {unitLabel}
                      </p>
                    </div>
                    <div className="rounded-lg bg-paper-card p-1.5 border border-line/40">
                      <p className="text-[9px] uppercase text-muted">Kasalukuyan</p>
                      <p className="text-xs font-bold text-forest-deep">
                        {item.utilityDetails?.currentReading ?? "—"} {unitLabel}
                      </p>
                    </div>
                    <div className="rounded-lg bg-forest/10 p-1.5 border border-forest/20">
                      <p className="text-[9px] uppercase text-forest font-bold">Nonsumo</p>
                      <p className="text-xs font-bold text-forest-deep">
                        {item.utilityDetails?.unitsUsed ?? "—"} {unitLabel}
                      </p>
                    </div>
                  </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-muted font-mono-brand pt-1">
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5 shrink-0 text-muted/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {item.dateSubmitted}
                    </span>
                  </div>
                </div>

                {/* Baba: Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button 
                    disabled={isPending}
                    onClick={() => handleAction(item.id, "reject")}
                    className="w-full rounded-xl border border-line py-2.5 text-xs font-bold text-coral-deep transition-all hover:bg-coral/10 active:scale-95 disabled:opacity-50"
                  >
                    Tanggihan
                  </button>
                  <button 
                    disabled={isPending}
                    onClick={() => handleAction(item.id, "approve")}
                    className="w-full rounded-xl bg-forest py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-forest-deep active:scale-95 disabled:opacity-50"
                  >
                    Aprubahan
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center rounded-2xl border border-dashed border-line bg-paper/30">
          <p className="text-xs text-muted font-medium">Walang naghihintay na aprubahan sa ngayon.</p>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative w-full max-w-2xl rounded-3xl border border-line/80 bg-paper-card p-5 sm:p-6 shadow-2xl flex flex-col space-y-4 animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-forest animate-pulse" />
                <h4 className="font-display text-sm font-bold text-forest-deep tracking-wide">
                  Litrato ng Patunay (Full Preview)
                </h4>
              </div>
              <button 
                onClick={() => setSelectedImage(null)}
                className="group flex h-8 w-8 items-center justify-center rounded-full bg-paper text-muted hover:bg-coral/10 hover:text-coral-deep transition-all border border-line/60"
                title="Isara"
              >
                <svg className="h-4 w-4 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Image Container */}
            <div className="relative w-full h-[60vh] sm:h-[65vh] bg-forest-deep/5 rounded-2xl overflow-hidden border border-line/40 flex items-center justify-center">
              <Image 
                src={selectedImage} 
                alt="Full Reading Preview" 
                fill
                sizes="(max-width: 1024px) 100vw, 700px"
                className="object-contain p-2" 
              />
            </div>

            {/* Footer / Tip */}
            <div className="flex items-center justify-center pt-1">
              <p className="font-mono-brand text-[10px] text-muted">
                I-click sa labas ng kahon o ang X button para isara.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}