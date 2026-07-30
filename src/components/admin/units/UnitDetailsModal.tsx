"use client";

import { useState, useMemo } from "react";
import { Unit } from "@/src/types/admin/unit";
import { MapPin, User, Building2, Search, X, Lock, Edit3, Layers, Tag, FileText } from "lucide-react";

interface UnitDetailsModalProps {
    isOpen: boolean;
    unit: (Unit & {
        unitLeaseStatus?: string;
        unitTenantName?: string;
        floor?: string;
        type?: string;
        description?: string;
    }) | null;
    onClose: () => void;
    onOpenAddRoom: (unit: Unit) => void;
    onOpenEditUnit?: (unit: Unit) => void;
}

export function UnitDetailsModal({
    isOpen,
    unit,
    onClose,
    onOpenAddRoom,
    onOpenEditUnit
}: UnitDetailsModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("All");

    if (!isOpen || !unit) return null;

    const isWholeUnitLease = Boolean(
        unit.unitTenantName ||
        (unit.unitLeaseStatus && unit.unitLeaseStatus !== "Vacant" && (!unit.rooms || unit.rooms.length === 0))
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Occupied":
                return "bg-forest/10 text-forest border-forest/20";
            case "Reserved":
                return "bg-amber-100 text-amber-700 border-amber-200";
            case "Vacant":
                return "bg-coral/15 text-coral-deep border-coral/30";
            case "Maintenance":
                return "bg-gray-100 text-gray-600 border-gray-200";
            default:
                return "bg-gray-100 text-gray-600 border-gray-200";
        }
    };

    const filteredRooms = useMemo(() => {
        if (isWholeUnitLease || !unit.rooms) return [];
        return unit.rooms.filter((room) => {
            const matchesSearch =
                room.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                room.tenantName?.toLowerCase().includes(searchQuery.toLowerCase());

            if (selectedStatus === "All") return matchesSearch;
            return matchesSearch && room.status === selectedStatus;
        });
    }, [unit.rooms, searchQuery, selectedStatus, isWholeUnitLease]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-line bg-paper-card shadow-2xl overflow-hidden">

                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-paper">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="font-display text-lg font-bold text-forest-deep">{unit.name}</h2>
                            {unit.unitStatus && (
                                <span className={`rounded-full border px-2.5 py-0.5 font-mono-brand text-[10px] font-bold ${getStatusBadge(unit.unitStatus)}`}>
                                    {unit.unitStatus.charAt(0).toUpperCase() + unit.unitStatus.slice(1).toLowerCase()}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted/70" /> {unit.address || "Pangunahing Lokasyon"}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-muted hover:bg-line/40 hover:text-ink transition-all cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Modal Body (Scrollable) */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">

                    {/* Unit Summary & Detailed Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-forest/5 p-4 rounded-2xl border border-forest/10">
                        {/* Buwanang Renta */}
                        <div>
                            <span className="text-[10px] uppercase font-mono-brand text-muted tracking-wide block mb-1">Buwanang Renta</span>
                            <span className="font-mono-brand text-base font-bold text-forest">
                                ₱{Number(unit.monthlyRent || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        {/* Floor / Palapag */}
                        <div>
                            <span className="text-[10px] uppercase font-mono-brand text-muted tracking-wide block mb-1 flex items-center gap-1">
                                <Layers className="h-3 w-3" /> Palapag (Floor)
                            </span>
                            <span className="text-xs font-bold text-forest-deep">
                                {unit.floor || "1st Floor"}
                            </span>
                        </div>

                        {/* Unit Type */}
                        <div>
                            <span className="text-[10px] uppercase font-mono-brand text-muted tracking-wide block mb-1 flex items-center gap-1">
                                <Tag className="h-3 w-3" /> Uri ng Unit
                            </span>
                            <span className="text-xs font-bold text-forest-deep">
                                {unit.type || "Studio"}
                            </span>
                        </div>

                        {/* Tenant ng Buong Unit (Kung meron man) */}
                        {unit.unitTenantName && (
                            <div className="sm:col-span-2 md:col-span-3 pt-2 border-t border-forest/10 flex items-center justify-between">
                                <span className="text-[10px] uppercase font-mono-brand text-muted tracking-wide">Tenant ng Buong Unit:</span>
                                <div className="flex items-center gap-1.5 text-xs text-forest-deep font-bold">
                                    <User className="h-3.5 w-3.5 text-forest" />
                                    <span>{unit.unitTenantName}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Deskripsyon ng Unit (Kung nakalagay) */}
                    {unit.description && (
                        <div className="rounded-2xl border border-line bg-paper p-4 space-y-1.5">
                            <span className="text-[10px] uppercase font-mono-brand text-muted tracking-wide flex items-center gap-1">
                                <FileText className="h-3 w-3" /> Deskripsyon
                            </span>
                            <p className="text-xs text-ink leading-relaxed">
                                {unit.description}
                            </p>
                        </div>
                    )}

                    {/* Beds / Rooms Section */}
                    {isWholeUnitLease ? (
                        <div className="rounded-2xl border border-dashed border-line/80 bg-paper/50 p-8 text-center space-y-2">
                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                <Lock className="h-5 w-5" />
                            </div>
                            <p className="font-display text-sm font-bold text-forest-deep">Naka-Whole Unit Lease ang Unit na ito</p>
                            <p className="text-xs text-muted">Buong unit ang inuupahan ng tenant kaya walang hiwalay na bed space.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <h4 className="font-mono-brand text-xs font-bold uppercase tracking-wider text-muted">
                                    Listahan ng mga Bed ({filteredRooms.length})
                                </h4>

                                <div className="flex flex-col sm:flex-row items-center gap-2">
                                    {/* Search filter for beds */}
                                    <div className="relative w-full sm:w-48">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-muted pointer-events-none">
                                            <Search className="w-3.5 h-3.5" />
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Hanapin ang bed..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full rounded-xl border border-line bg-paper py-1.5 pl-8 pr-3 font-mono-brand text-[11px] text-ink outline-none focus:border-forest"
                                        />
                                    </div>

                                    {/* Add Bed Button inside Modal */}
                                    <button
                                        onClick={() => {
                                            onClose();
                                            onOpenAddRoom(unit);
                                        }}
                                        className="w-full sm:w-auto rounded-xl bg-forest px-3 py-1.5 font-mono-brand text-xs font-bold text-white hover:bg-forest-deep transition-all shadow-sm cursor-pointer"
                                    >
                                        + Magdagdag ng Bed
                                    </button>
                                </div>
                            </div>

                            {/* Beds Grid */}
                            {filteredRooms.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line p-6 text-center bg-paper">
                                    <Building2 className="w-6 h-6 text-muted mb-2 stroke-[1.5]" />
                                    <p className="font-display text-xs font-bold text-forest-deep">Walang Nakitang Bed</p>
                                    <p className="text-[11px] text-muted">Subukang baguhin ang iyong hinahanap.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {filteredRooms.map((room) => (
                                        <div key={room.id} className="rounded-2xl border border-line bg-paper p-3.5 space-y-2.5 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-forest-deep text-xs">{room.roomNumber}</span>
                                                <span className={`rounded-full border px-2 py-0.5 font-mono-brand text-[10px] font-bold ${getStatusBadge(room.status)}`}>
                                                    {room.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-line/50">
                                                <span className="text-muted">{room.tenantName || "Walang Tenant"}</span>
                                                <span className="font-bold text-forest-deep">₱{room.monthlyRent.toLocaleString()}/mo</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Modal Footer (Kasama na ang Edit button at Isara button) */}
                <div className="border-t border-line px-6 py-3.5 bg-paper flex items-center justify-between">
                    <div>
                        {onOpenEditUnit && (
                            <button
                                onClick={() => {
                                    onClose();
                                    onOpenEditUnit(unit);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-forest/30 bg-forest/5 px-4 py-2 font-mono-brand text-xs font-bold text-forest hover:bg-forest hover:text-white transition-all shadow-sm cursor-pointer"
                            >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>I-edit ang Unit</span>
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-xl border border-line px-4 py-2 font-mono-brand text-xs font-bold text-muted hover:bg-line/20 hover:text-ink cursor-pointer transition-all"
                    >
                        Isara
                    </button>
                </div>

            </div>
        </div>
    );
}