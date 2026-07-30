// ==========================================
// EDIT UNIT MODAL COMPONENT (components/admin/EditUnitModal.tsx)
// ==========================================
"use client";

import { useState, useEffect, useTransition } from "react";
import { Unit } from "@/src/types/admin/unit";
import { X, Building2, Layers, Tag, FileText } from "lucide-react";
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
    const [name, setName] = useState("");
    const [monthlyRent, setMonthlyRent] = useState("");
    const [floor, setFloor] = useState("1st Floor");
    const [type, setType] = useState("Studio");
    const [description, setDescription] = useState("");

    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // Kapag nagbago ang selected unit, i-load ang kasalukuyang data nito sa form state
    useEffect(() => {
        if (unit) {
            setName(unit.name || "");
            setMonthlyRent(unit.monthlyRent ? unit.monthlyRent.toString() : "");
            setFloor((unit as any).floor || "1st Floor");
            setType((unit as any).type || "Studio");
            setDescription((unit as any).description || "");
            setError(null);
        }
    }, [unit]);

    if (!isOpen || !unit) return null;

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
                    // I-pass ang updated unit pabalik sa client wrapper
                    onUpdateUnit({
                        ...unit,
                        name: result.unit.name,
                        monthlyRent: Number(result.unit.monthlyRent),
                        floor: (result.unit as any).floor,
                        type: (result.unit as any).type,
                        description: (result.unit as any).description,
                    });
                    onClose();
                } else {
                    setError(result.error || "May error sa pag-update ng unit.");
                }
            } catch (err) {
                setError("Nagkaroon ng hindi inaasahang error.");
            }
        });
    };

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
                        className="rounded-full p-2 text-muted hover:bg-line/40 hover:text-ink transition-all cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Modal Form */}
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
                            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2 font-mono-brand text-xs text-ink focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest shadow-sm"
                        />
                    </div>

                    {/* Buwanang Renta */}
                    <div className="space-y-1.5">
                        <label className="block font-mono-brand text-[11px] font-bold uppercase tracking-wide text-muted">
                            Buwanang Renta (₱)
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted font-mono-brand text-xs">
                                ₱
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                value={monthlyRent}
                                onChange={(e) => setMonthlyRent(e.target.value)}
                                placeholder="0.00"
                                className="w-full rounded-xl border border-line bg-paper py-2 pl-8 pr-3 font-mono-brand text-xs text-ink focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Floor / Palapag */}
                        <div className="space-y-1.5">
                            <label className="block font-mono-brand text-[11px] font-bold uppercase tracking-wide text-muted flex items-center gap-1">
                                <Layers className="h-3 w-3" /> Palapag (Floor)
                            </label>
                            <select
                                value={floor}
                                onChange={(e) => setFloor(e.target.value)}
                                className="w-full rounded-xl border border-line bg-paper px-3 py-2 font-mono-brand text-xs text-ink focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest shadow-sm cursor-pointer"
                            >
                                <option value="Ground Floor">Ground Floor</option>
                                <option value="1st Floor">1st Floor</option>
                                <option value="2nd Floor">2nd Floor</option>
                                <option value="3rd Floor">3rd Floor</option>
                                <option value="4th Floor">4th Floor</option>
                                <option value="Rooftop">Rooftop</option>
                            </select>
                        </div>

                        {/* Unit Type */}
                        <div className="space-y-1.5">
                            <label className="block font-mono-brand text-[11px] font-bold uppercase tracking-wide text-muted flex items-center gap-1">
                                <Tag className="h-3 w-3" /> Uri ng Unit
                            </label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full rounded-xl border border-line bg-paper px-3 py-2 font-mono-brand text-xs text-ink focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest shadow-sm cursor-pointer"
                            >
                                <option value="Studio">Studio</option>
                                <option value="Bedspace">Bedspace</option>
                                <option value="1 Bedroom">1 Bedroom</option>
                                <option value="2 Bedroom">2 Bedroom</option>
                                <option value="Commercial">Commercial Space</option>
                            </select>
                        </div>
                    </div>

                    {/* Deskripsyon */}
                    <div className="space-y-1.5">
                        <label className="block font-mono-brand text-[11px] font-bold uppercase tracking-wide text-muted flex items-center gap-1">
                            <FileText className="h-3 w-3" /> Deskripsyon (Opsyonal)
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Maglagay ng maikling deskripsyon o mga amenities ng unit..."
                            className="w-full rounded-xl border border-line bg-paper p-3 font-mono-brand text-xs text-ink focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest shadow-sm resize-none"
                        />
                    </div>

                    {/* Modal Actions */}
                    <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-line">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="rounded-xl border border-line px-4 py-2 font-mono-brand text-xs font-bold text-muted hover:bg-line/20 hover:text-ink cursor-pointer transition-all"
                        >
                            Kanselahin
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="rounded-xl bg-forest px-5 py-2 font-mono-brand text-xs font-bold text-white hover:bg-forest-deep shadow-sm cursor-pointer transition-all disabled:opacity-50"
                        >
                            {isPending ? "Nag-a-update..." : "I-save ang Pagbabago"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}