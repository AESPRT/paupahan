"use client";

import { useState } from "react";
import { UtilityItem } from "@/src/types/tenant/tenant-bill";

interface ReadingUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  utilityType: "electricity" | "water";
  utilityData: UtilityItem;
  onSubmitReading: (utilityType: "electricity" | "water", reading: number, photoUrl: string) => void;
}

export function ReadingUploadModal({
  isOpen,
  onClose,
  utilityType,
  utilityData,
  onSubmitReading,
}: ReadingUploadModalProps) {
  const isElectricity = utilityType === "electricity";
  const title = isElectricity ? "Kuryente (Electricity)" : "Tubig (Water)";
  const unit = isElectricity ? "kWh" : "m³";

  const [currentReading, setCurrentReading] = useState<string>(
    utilityData.currentReading ? String(utilityData.currentReading) : ""
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    utilityData.proofPhotoUrl || null
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Demo preview reader
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const numericReading = parseFloat(currentReading);

    if (isNaN(numericReading)) {
      setError("Paki-lagay ang tamang meter reading.");
      return;
    }

    if (numericReading < utilityData.previousReading) {
      setError(`Ang bagong reading ay hindi pwedeng mas mababa sa nakaraang reading (${utilityData.previousReading} ${unit}).`);
      return;
    }

    if (!photoPreview) {
      setError("Required na mag-upload ng malinaw na larawan ng submeter bilang patunay.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitReading(utilityType, numericReading, photoPreview);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl border border-line bg-paper-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2.5">
            {isElectricity ? (
              /* Lightning SVG Icon */
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            ) : (
              /* Water Drop SVG Icon */
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
            )}
            <h3 className="font-display text-base font-bold text-forest-deep">
              Mag-submit ng Reading sa {title}
            </h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-muted hover:bg-paper">
            {/* Close SVG Icon */}
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="flex items-center justify-center gap-1.5 rounded-2xl border border-coral/30 bg-coral/10 p-3 text-center text-xs font-bold text-coral-deep">
              {/* Warning Triangle SVG Icon */}
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Previous Reading Info */}
          <div className="flex justify-between rounded-2xl bg-paper p-3 font-mono-brand text-xs">
            <span className="text-muted">Nakaraang Reading (Previous):</span>
            <span className="font-bold text-forest-deep">
              {utilityData.previousReading} {unit}
            </span>
          </div>

          {/* Current Reading Input */}
          <div>
            <label className="block text-xs font-bold text-forest-deep mb-1">
              Kasalukuyang Submeter Reading ({unit}) *
            </label>
            <input
              type="number"
              step="any"
              placeholder={`e.g. ${utilityData.previousReading + 10}`}
              value={currentReading}
              onChange={(e) => setCurrentReading(e.target.value)}
              className="w-full rounded-2xl border border-line bg-paper px-4 py-3 font-mono-brand text-sm font-bold text-forest-deep outline-none focus:border-forest focus:ring-2 focus:ring-forest/10"
              required
            />
          </div>

          {/* Meter Photo Proof Upload */}
          <div>
            <label className="block text-xs font-bold text-forest-deep mb-1">
              Kunan ng Larawan ang Meter (Proof Photo) *
            </label>
            
            <div className="relative mt-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-paper p-4 transition-colors hover:border-forest">
              {photoPreview ? (
                <div className="relative w-full space-y-2">
                  {/* Preview Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Meter Proof Preview"
                    className="h-40 w-full rounded-xl object-cover border border-line"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="w-full rounded-xl bg-coral/10 py-1.5 font-mono-brand text-[11px] font-bold text-coral-deep flex items-center justify-center gap-1"
                  >
                    {/* Refresh / Replace SVG Icon */}
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Palitan ang Larawan
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center cursor-pointer text-center">
                  {/* Camera SVG Icon */}
                  <div className="rounded-full bg-forest/10 p-3 text-forest">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="mt-2 text-xs font-bold text-forest">
                    I-click para mag-upload o kumuha ng litrato
                  </span>
                  <span className="mt-0.5 text-[10px] text-muted">
                    Siguraduhing malinaw ang numero sa submeter
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 rounded-2xl border border-line py-3 font-mono-brand text-xs font-bold text-muted hover:bg-paper"
            >
              Kanselahin
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-1/2 rounded-2xl bg-forest py-3 font-mono-brand text-xs font-bold text-white shadow-md hover:bg-forest-deep disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>{isSubmitting ? "Isinusumite..." : "I-submit Reading"}</span>
              {!isSubmitting && (
                /* Arrow Right SVG Icon */
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}