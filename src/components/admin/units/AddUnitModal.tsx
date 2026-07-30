"use client";

import { useState } from "react";

interface AddUnitModalProps {
  isOpen: boolean;
  propertyName: string;
  onClose: () => void;
  onAddUnit: (unitData: {
    unitName: string;
    monthlyRent: number;
    floor: string;
    type: string;
  }) => void;
}

export function AddUnitModal({
  isOpen,
  propertyName,
  onClose,
  onAddUnit,
}: AddUnitModalProps) {
  const [unitName, setUnitName] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [floor, setFloor] = useState("1st Floor"); // 👈 Bagong state para sa floor
  const [type, setType] = useState("Studio");       // 👈 Bagong state para sa unit type

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!unitName.trim()) return;

    onAddUnit({
      unitName,
      monthlyRent: Number(monthlyRent) || 0,
      floor,
      type,
    });

    setUnitName("");
    setMonthlyRent("");
    setFloor("1st Floor");
    setType("Studio");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-line bg-paper-card p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-forest-deep">
              Magdagdag ng Unit sa Hanap-Bahay
            </h2>
            <p className="text-xs text-muted">Para sa Property: {propertyName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted hover:bg-paper hover:text-ink cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-forest-deep mb-1">
              Pangalan / Numero ng Unit (Hal. Unit 101)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Unit 101 o Building A"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs font-medium text-ink outline-none focus:border-forest"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-forest-deep mb-1">
                Palapag / Floor
              </label>
              <input
                type="text"
                placeholder="e.g. 1st Floor"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs font-medium text-ink outline-none focus:border-forest"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-forest-deep mb-1">
                Uri ng Unit (Type)
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs font-medium text-ink outline-none focus:border-forest"
              >
                <option value="Studio">Studio</option>
                <option value="1-Bedroom">1-Bedroom</option>
                <option value="2-Bedroom">2-Bedroom</option>
                <option value="Solo Room">Solo Room</option>
                <option value="Bedspace">Bedspace</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-deep mb-1">
              Buwanang Renta (Monthly Rent - ₱)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="e.g. 6500"
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono-brand text-xs font-bold text-ink outline-none focus:border-forest"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-line px-4 py-2 text-xs font-bold text-muted hover:bg-paper cursor-pointer"
            >
              Kanselahin
            </button>
            <button
              type="submit"
              className="rounded-xl bg-forest px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-forest-deep cursor-pointer"
            >
              I-save ang Unit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}