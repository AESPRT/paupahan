"use client";

import { useState, useEffect } from "react";
import { UtilityRate, UtilityType } from "@/src/types/admin/utility";

interface AssignBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (data: { id: string; ratePerUnit: number }) => void; // O ang update handler para sa rate
  currentRates?: UtilityRate[]; // Mga kasalukuyang rates para ma-edit
}

export function AssignBillModal({
  isOpen,
  onClose,
  onAssign,
  currentRates = [],
}: AssignBillModalProps) {
  const [selectedRateId, setSelectedRateId] = useState("");
  const [utilityName, setUtilityName] = useState("");
  const [unitLabel, setUnitLabel] = useState("");
  const [ratePerUnit, setRatePerUnit] = useState("");

  // Kapag binuksan ang modal, piliin ang unang utility rate bilang default
  useEffect(() => {
    if (isOpen && currentRates.length > 0) {
      setSelectedRateId(currentRates[0].id);
      setUtilityName(currentRates[0].name);
      setUnitLabel(currentRates[0].unitLabel);
      setRatePerUnit(currentRates[0].ratePerUnit.toString());
    }
  }, [isOpen, currentRates]);

  // Kapag nagbago ang piniling utility rate sa dropdown
  const handleRateChange = (id: string) => {
    setSelectedRateId(id);
    const rateItem = currentRates.find((r) => r.id === id);
    if (rateItem) {
      setUtilityName(rateItem.name);
      setUnitLabel(rateItem.unitLabel);
      setRatePerUnit(rateItem.ratePerUnit.toString());
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!selectedRateId || !ratePerUnit) return;

    onAssign({
      id: selectedRateId,
      ratePerUnit: Number(ratePerUnit),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-line bg-paper-card p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <h2 className="font-display text-lg font-bold text-forest-deep">
            I-update ang Rate ng Utility
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-paper hover:text-ink"
            aria-label="Close modal"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Piliin kung aling Utility ang ia-update ang rate */}
          <div>
            <label className="block text-xs font-bold text-forest-deep mb-1">
              Uri ng Utility
            </label>
            <select
              value={selectedRateId}
              onChange={(e) => handleRateChange(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs font-medium text-ink outline-none"
            >
              {currentRates.map((rate) => (
                <option key={rate.id} value={rate.id}>
                  {rate.name} ({rate.unitLabel})
                </option>
              ))}
            </select>
          </div>

          {/* Unit Label (Basal kung paano sinusukat e.g. kWh, m³, Flat) */}
          <div>
            <label className="block text-xs font-bold text-forest-deep mb-1">
              Unit of Measurement (Basihan)
            </label>
            <input
              type="text"
              disabled
              value={unitLabel}
              className="w-full rounded-xl border border-line bg-paper/50 px-3.5 py-2 text-xs font-medium text-muted outline-none cursor-not-allowed"
            />
          </div>

          {/* Bagong Rate per Unit */}
          <div>
            <label className="block text-xs font-bold text-forest-deep mb-1">
              Bagong Rate Bawat Unit (₱)
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={ratePerUnit}
              onChange={(e) => setRatePerUnit(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-3.5 py-2 text-xs font-medium text-ink outline-none focus:border-forest"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-line px-4 py-2 text-xs font-bold text-muted hover:bg-paper"
            >
              Kanselahin
            </button>
            <button
              type="submit"
              className="rounded-xl bg-forest px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-forest-deep"
            >
              I-save ang Rate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}