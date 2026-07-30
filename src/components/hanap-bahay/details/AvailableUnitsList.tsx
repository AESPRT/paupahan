"use client";

import { Bed, Layers, Tag, ChevronRight, Home } from "lucide-react";
import { UnitDetail } from "@/src/actions/hanap-bahay/property-details-action";

interface AvailableUnitsListProps {
    units: UnitDetail[];
    onSelectUnitToBook: (bookingTarget: { title: string; price: number; type: 'unit' | 'bed'; id: string }) => void;
}

export function AvailableUnitsList({ units, onSelectUnitToBook }: AvailableUnitsListProps) {
    const defaultPlaceholder = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80";

    return (
        <div className="space-y-6">
            {units.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#E4DDC9] bg-[#FFFDF8] p-10 text-center shadow-sm">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1F4B3F]/10 text-[#1F4B3F] mb-4">
                        <Home className="h-7 w-7" />
                    </div>
                    <h3 className="font-display text-base font-extrabold text-[#153730] mb-2">Walang Kasalukuyang Bakanteng Unit</h3>
                    <p className="text-xs text-[#6B7B74] max-w-sm mb-6 leading-relaxed">
                        Puno ang mga unit sa ngayon, ngunit maaari kang mag-inquire para maunang ma-notify kapag may nagbakante.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {units.map((unit) => {
                        // Mangolekta ng lahat ng bakanteng beds mula sa unit na ito
                        const vacantBeds = unit.beds.filter(bed => bed.status === "vacant");
                        const isBedspace = unit.type.toLowerCase().includes("bedspace") || unit.beds.length > 0;

                        return (
                            <div
                                key={unit.id}
                                className="group flex flex-col rounded-3xl border border-[#E4DDC9] bg-[#FFFDF8] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#153730]/30 transition-all duration-300"
                            >
                                {/* Unit Image Header */}
                                <div className="relative h-44 w-full overflow-hidden bg-[#FAF7EF]">
                                    <img
                                        src={defaultPlaceholder}
                                        alt={unit.unitNumber}
                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

                                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-[#1F4B3F]/90 backdrop-blur-md px-3 py-1 font-mono-brand text-[10px] font-bold text-white shadow-md">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#D98F1E] animate-pulse" />
                                            {unit.status}
                                        </span>
                                        <span className="rounded-full bg-[#FFFDF8]/90 backdrop-blur-md px-3 py-1 font-mono-brand text-[10px] font-bold text-[#153730] shadow-md flex items-center gap-1">
                                            <Layers className="h-3 w-3 text-[#153730]" />
                                            {unit.floor}
                                        </span>
                                    </div>

                                    <div className="absolute bottom-3 left-3">
                                        <span className="rounded-xl bg-[#FFFDF8]/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-[#153730] shadow-md flex items-center gap-1">
                                            <Tag className="h-3.5 w-3.5 text-[#D98F1E]" />
                                            {unit.type}
                                        </span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-display text-base font-extrabold text-[#153730]">
                                                    Unit {unit.unitNumber}
                                                </h4>
                                                <p className="text-xs text-[#6B7B74]">
                                                    {isBedspace ? "Bedspace Accommodation" : "Buong Unit"}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] uppercase font-mono-brand text-[#6B7B74] block">Renta</span>
                                                <span className="font-display text-base font-black text-[#153730]">
                                                    ₱{unit.price.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* ✨ Ipakita ang mga kama/rooms sa ilalim ng unit kung meron man */}
                                        {unit.beds.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-[#E4DDC9]/60 space-y-2">
                                                <span className="text-[11px] font-extrabold text-[#153730] block">Mga Kama (Beds / Room Numbers):</span>
                                                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                                    {unit.beds.map(bed => {
                                                        const isVacant = bed.status === "vacant";
                                                        return (
                                                            <div
                                                                key={bed.id}
                                                                className={`flex items-center justify-between p-2 rounded-xl border text-xs ${isVacant
                                                                        ? "bg-[#FAF7EF] border-[#E4DDC9] hover:border-[#153730]"
                                                                        : "bg-gray-100 border-gray-200 opacity-60"
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <Bed className="h-3.5 w-3.5 text-[#1F4B3F]" />
                                                                    <span className="font-bold text-[#153730]">Kama {bed.bedNumber}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold text-[#153730]">₱{bed.price.toLocaleString()}</span>
                                                                    {isVacant ? (
                                                                        <button
                                                                            onClick={() => onSelectUnitToBook({
                                                                                title: `Unit ${unit.unitNumber} (Kama ${bed.bedNumber})`,
                                                                                price: bed.price,
                                                                                type: 'bed',
                                                                                id: bed.id
                                                                            })}
                                                                            className="rounded-lg bg-[#153730] px-2.5 py-1 text-[10px] font-bold text-white hover:bg-[#1F4B3F]"
                                                                        >
                                                                            I-book ang Kama
                                                                        </button>
                                                                    ) : (
                                                                        <span className="text-[10px] font-bold text-red-500 uppercase">Occupied</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action para i-book ang buong unit */}
                                    <div className="pt-3 border-t border-[#E4DDC9]/60 flex items-center justify-between">
                                        <span className="text-[11px] text-[#6B7B74]">Gusto mo ba ang buong espasyo?</span>
                                        <button
                                            onClick={() => onSelectUnitToBook({
                                                title: `Buong Unit ${unit.unitNumber}`,
                                                price: unit.price,
                                                type: 'unit',
                                                id: unit.id
                                            })}
                                            className="rounded-xl bg-[#153730] px-4 py-2 text-center font-display text-xs font-bold text-white hover:bg-[#1F4B3F] shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                                        >
                                            <span>Mag-book ng Buong Unit</span>
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}