"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { UnitType, UnitFloor, DEFAULT_UNIT_FLOOR } from "@/src/types/admin/unit";

interface AddUnitModalProps {
  isOpen: boolean;
  propertyName: string;
  onClose: () => void;
  onAddUnit: (unitData: {
    unitName: string;
    monthlyRent: number;
    floor: UnitFloor;
    type: UnitType;
  }) => void;
}

// ── Reusable Modern Minimalist Select Component ──
interface CustomSelectProps<T extends string> {
  label: string;
  value: T;
  options: { key: string; value: T }[];
  onChange: (val: T) => void;
}

function CustomSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: CustomSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Isara ang dropdown kapag nag-click sa labas
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-bold text-forest-deep mb-1.5">
        {label}
      </label>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between rounded-2xl border px-3.5 py-2.5 text-xs font-medium transition-all duration-200 cursor-pointer bg-paper ${
          open
            ? "border-forest ring-2 ring-forest/10 text-forest-deep shadow-sm"
            : "border-line text-ink hover:border-forest/50"
        }`}
      >
        <span className="truncate">{value}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted transition-transform duration-200 ${
            open ? "rotate-180 text-forest" : ""
          }`}
        />
      </button>

      {/* Modern Floating Popover Options */}
      {open && (
        <div className="absolute left-0 right-0 z-30 mt-1.5 max-h-56 overflow-y-auto rounded-2xl border border-line/80 bg-paper-card p-1.5 shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-2 duration-150 no-scrollbar">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                type="button"
                key={opt.key}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-forest/10 text-forest-deep font-semibold"
                    : "text-ink hover:bg-paper hover:text-forest-deep"
                }`}
              >
                <span className="truncate">{opt.value}</span>
                {isSelected && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-forest text-white">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Modal Component ──
export function AddUnitModal({
  isOpen,
  propertyName,
  onClose,
  onAddUnit,
}: AddUnitModalProps) {
  const [unitName, setUnitName] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [floor, setFloor] = useState<UnitFloor>(DEFAULT_UNIT_FLOOR);
  const [type, setType] = useState<UnitType>(UnitType.STUDIO);

  if (!isOpen) return null;

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
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
    setFloor(DEFAULT_UNIT_FLOOR);
    setType(UnitType.STUDIO);
    onClose();
  };

  const floorOptions = Object.entries(UnitFloor).map(([key, val]) => ({
    key,
    value: val,
  }));

  const typeOptions = Object.entries(UnitType).map(([key, val]) => ({
    key,
    value: val,
  }));

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
            type="button"
            className="rounded-full p-1 text-muted hover:bg-paper hover:text-ink cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-forest-deep mb-1.5">
              Pangalan / Numero ng Unit (Hal. Unit 101)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Unit 101 o Building A"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              className="w-full rounded-2xl border border-line bg-paper px-3.5 py-2.5 text-xs font-medium text-ink outline-none transition-all focus:border-forest focus:ring-2 focus:ring-forest/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Custom Modern Floor Select */}
            <CustomSelect
              label="Palapag / Floor"
              value={floor}
              options={floorOptions}
              onChange={(val) => setFloor(val)}
            />

            {/* Custom Modern Unit Type Select */}
            <CustomSelect
              label="Uri ng Unit (Type)"
              value={type}
              options={typeOptions}
              onChange={(val) => setType(val)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-deep mb-1.5">
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
              className="w-full rounded-2xl border border-line bg-paper px-3.5 py-2.5 font-mono-brand text-xs font-bold text-ink outline-none transition-all focus:border-forest focus:ring-2 focus:ring-forest/10"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-line px-4 py-2.5 text-xs font-bold text-muted hover:bg-paper cursor-pointer transition-colors"
            >
              Kanselahin
            </button>
            <button
              type="submit"
              className="rounded-xl bg-forest px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-forest-deep cursor-pointer transition-all active:scale-95"
            >
              I-save ang Unit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}