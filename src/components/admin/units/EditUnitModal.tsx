"use client";

import { useState, useTransition } from "react";
import { Unit, UnitType, UnitFloor, DEFAULT_UNIT_FLOOR } from "@/src/types/admin/unit";
import { X, Building2, Layers, Tag, FileText, ChevronDown } from "lucide-react";
import { updateUnitAction } from "@/src/actions/units-actions";

interface EditUnitModalProps {
  isOpen: boolean;
  unit: Unit | null;
  onClose: () => void;
  onUpdateUnit: (updatedUnit: Unit) => void;
}

export function EditUnitModal({
  isOpen,
  unit,
  onClose,
  onUpdateUnit,
}: EditUnitModalProps) {
  if (!isOpen || !unit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl border border-line bg-paper-card shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-paper">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/10 text-forest">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-forest-deep">I-edit ang Unit</h2>
              <p className="text-[11px] text-muted">Baguhin ang mga detalye ng unit na ito.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-full p-2 text-muted hover:bg-line/40 hover:text-ink transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 👈 Pasa ang key={unit.id} para mag-reset ang state kapag nagbago ang unit */}
        <EditUnitForm
          key={unit.id}
          unit={unit}
          onClose={onClose}
          onUpdateUnit={onUpdateUnit}
        />
      </div>
    </div>
  );
}

// ==========================================
// INNER FORM COMPONENT (No useEffect required)
// ==========================================
interface EditUnitFormProps {
  unit: Unit;
  onClose: () => void;
  onUpdateUnit: (updatedUnit: Unit) => void;
}

function EditUnitForm({ unit, onClose, onUpdateUnit }: EditUnitFormProps) {
  // Direktang i-initialize ang state mula sa unit prop!
  const [name, setName] = useState(unit.name || "");
  const [monthlyRent, setMonthlyRent] = useState(
    unit.monthlyRent ? unit.monthlyRent.toString() : ""
  );
  const [floor, setFloor] = useState<UnitFloor>(
    (unit.floor as UnitFloor) || DEFAULT_UNIT_FLOOR
  );
  const [type, setType] = useState<UnitType>(
    (unit.type as UnitType) || UnitType.STUDIO
  );
  const [description, setDescription] = useState(unit.description || "");

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Kailangan ang pangalan ng unit.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateUnitAction({
          id: unit.id,
          name,
          monthlyRent: Number(monthlyRent) || 0,
          floor,
          type,
          description,
        });

        if (result.success && result.unit) {
          onUpdateUnit({
            ...unit,
            name: result.unit.name,
            monthlyRent: Number(result.unit.monthlyRent),
            floor: (result.unit.floor as UnitFloor) || floor,
            type: (result.unit.type as UnitType) || type,
            description: result.unit.description || description,
          });
          onClose();
        } else {
          setError(result.error || "May error sa pag-update ng unit.");
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError("Nagkaroon ng hindi inaasahang error.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
      {error && (
        <div className="rounded-xl border border-coral/30 bg-coral/10 p-3 text-xs text-coral-deep font-bold">
          {error}
        </div>
      )}

      {/* Pangalan ng Unit */}
      <div className="space-y-1.5">
        <label className="block font-mono-brand text-[11px] font-bold uppercase tracking-wide text-muted">
          Pangalan ng Unit <span className="text-coral">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Hal. Unit 101 o Room A"
          required
          className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono-brand text-xs text-ink placeholder:text-muted/50 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all shadow-sm"
        />
      </div>

      {/* Buwanang Renta */}
      <div className="space-y-1.5">
        <label className="block font-mono-brand text-[11px] font-bold uppercase tracking-wide text-muted">
          Buwanang Renta (₱)
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted font-mono-brand text-xs">
            ₱
          </span>
          <input
            type="number"
            step="0.01"
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-xl border border-line bg-paper py-2.5 pl-8 pr-3.5 font-mono-brand text-xs text-ink placeholder:text-muted/50 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Minimalist Grid ng Select Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Floor / Palapag Dropdown */}
        <div className="space-y-1.5">
          <label className="block font-mono-brand text-[11px] font-bold uppercase tracking-wide text-muted flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-forest" /> Palapag (Floor)
          </label>
          <div className="relative">
            <select
              value={floor}
              onChange={(e) => setFloor(e.target.value as UnitFloor)}
              className="w-full appearance-none rounded-xl border border-line bg-paper px-3.5 py-2.5 pr-8 font-mono-brand text-xs text-ink focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all shadow-sm cursor-pointer"
            >
              {Object.values(UnitFloor).map((floorVal) => (
                <option key={floorVal} value={floorVal}>
                  {floorVal}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Unit Type Dropdown */}
        <div className="space-y-1.5">
          <label className="block font-mono-brand text-[11px] font-bold uppercase tracking-wide text-muted flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-forest" /> Uri ng Unit
          </label>
          <div className="relative">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as UnitType)}
              className="w-full appearance-none rounded-xl border border-line bg-paper px-3.5 py-2.5 pr-8 font-mono-brand text-xs text-ink focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all shadow-sm cursor-pointer"
            >
              {Object.values(UnitType).map((typeVal) => (
                <option key={typeVal} value={typeVal}>
                  {typeVal}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Deskripsyon */}
      <div className="space-y-1.5">
        <label className="block font-mono-brand text-[11px] font-bold uppercase tracking-wide text-muted flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-forest" /> Deskripsyon (Opsyonal)
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Maglagay ng maikling deskripsyon o mga amenities ng unit..."
          className="w-full rounded-xl border border-line bg-paper p-3 font-mono-brand text-xs text-ink placeholder:text-muted/50 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all shadow-sm resize-none"
        />
      </div>

      {/* Modal Actions */}
      <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-line">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="rounded-xl border border-line px-4 py-2 font-mono-brand text-xs font-bold text-muted hover:bg-line/20 hover:text-ink cursor-pointer transition-all disabled:opacity-50"
        >
          Kanselahin
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-forest px-5 py-2 font-mono-brand text-xs font-bold text-white hover:bg-forest-deep shadow-sm cursor-pointer transition-all active:scale-95 disabled:opacity-50"
        >
          {isPending ? "Nag-a-update..." : "I-save ang Pagbabago"}
        </button>
      </div>
    </form>
  );
}