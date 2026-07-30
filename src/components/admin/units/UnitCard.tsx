"use client";

import { useState, useMemo, useEffect } from "react";
import { Unit } from "@/src/types/admin/unit";
import {
  MapPin,
  User,
  Plus,
  Lock,
  Search,
  Building2,
  ArrowLeft,
  ArrowRight,
  Edit3
} from "lucide-react";
import { UnitDetailsModal } from "./UnitDetailsModal";

interface UnitCardProps {
  unit: Unit & {
    unitLeaseStatus?: "Occupied" | "Reserved" | "Vacant" | "Maintenance";
    unitTenantName?: string;
    floor?: string;
    type?: string;
    description?: string;
  };
  onOpenAddRoom: (unit: Unit) => void;
  onOpenEditUnit?: (unit: Unit) => void; // 👈 Bagong prop para sa pag-edit ng unit
}

export function UnitCard({ unit, onOpenAddRoom, onOpenEditUnit }: UnitCardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const isWholeUnitLease = Boolean(unit.unitTenantName || (unit.unitLeaseStatus && unit.unitLeaseStatus !== "Vacant" && (!unit.rooms || unit.rooms.length === 0)));

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setItemsPerPage(9);
      } else {
        setItemsPerPage(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRooms = filteredRooms.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <>
      {/* Ginawang clickable ang buong card para magbukas ang modal */}
      <div
        onClick={() => setIsDetailsModalOpen(true)}
        className="rounded-3xl border border-line bg-paper-card p-5 shadow-sm transition-all hover:shadow-md hover:border-forest/40 cursor-pointer space-y-4"
      >
        {/* Header: Unit Info, Unit Price, Status Badge, & Actions (Edit & Add Bed) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-line/60 pb-4">
          <div className="space-y-1.5 w-full">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="font-display text-lg font-bold text-forest-deep">
                {unit.name}
              </h3>
              {unit.unitStatus && (
                <span
                  className={`rounded-full border px-2.5 py-0.5 font-mono-brand text-[10px] font-bold ${getStatusBadge(
                    unit.unitStatus
                  )}`}
                >
                  {unit.unitStatus ? unit.unitStatus.charAt(0).toUpperCase() + unit.unitStatus.slice(1).toLowerCase() : ""}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted/70" />
              <span>{unit.address || "Pangunahing Lokasyon"}</span>
            </div>

            {unit.unitTenantName && (
              <div className="flex items-center gap-1.5 text-xs text-forest font-medium">
                <User className="h-3.5 w-3.5 shrink-0 text-forest/70" />
                <span><strong className="text-forest-deep">{unit.unitTenantName}</strong></span>
              </div>
            )}

            <div className="inline-flex items-center gap-1.5 rounded-full bg-forest/5 px-2.5 py-1 border border-forest/10 font-mono-brand text-xs">
              <span className="text-muted uppercase text-[10px]">Renta ng Unit:</span>
              <span className="font-bold text-forest">
                ₱{Number(unit.monthlyRent || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Action Buttons Group */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {/* 👉 Edit Unit Button sa Card Header */}
            {onOpenEditUnit && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Pigilan mag-trigger ang modal
                  onOpenEditUnit(unit);
                }}
                className="inline-flex items-center justify-center gap-1 rounded-xl border border-line bg-paper px-3 py-2 font-mono-brand text-xs font-bold text-muted hover:bg-forest/5 hover:text-forest transition-all shadow-sm cursor-pointer"
                title="I-edit ang Unit"
              >
                <Edit3 className="h-4 w-4" />
                <span className="hidden sm:inline">I-edit</span>
              </button>
            )}

            {!isWholeUnitLease && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Pigilan na mag-trigger ang modal click kapag pinindot ang Add Bed
                  onOpenAddRoom(unit);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-forest/30 bg-forest/5 px-3.5 py-2 font-mono-brand text-xs font-bold text-forest hover:bg-forest hover:text-white transition-all shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4 shrink-0 stroke-[2.5]" />
                <span>Bed</span>
              </button>
            )}
          </div>
        </div>

        {/* Beds Section o Whole Unit Notice */}
        <div onClick={(e) => e.stopPropagation()}>
          {isWholeUnitLease ? (
            <div className="rounded-2xl border border-dashed border-line/80 bg-paper/50 p-6 text-center space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Lock className="h-5 w-5" />
              </div>
              <p className="font-display text-xs font-bold text-forest-deep">
                Naka-Whole Unit Lease ang Unit na ito
              </p>
              <p className="text-[11px] text-muted">
                Buong unit ang inuupahan ng tenant kaya naka-hide ang mga bed space.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <h4 className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted shrink-0">
                  Mga Bed ({filteredRooms.length})
                </h4>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center w-full xl:w-auto">
                  <div className="relative w-full sm:w-56">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted pointer-events-none">
                      <Search className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Hanapin ang bed o tenant..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="w-full rounded-xl border border-line bg-paper-card py-1.5 pl-8 pr-3 font-mono-brand text-[11px] text-ink placeholder:text-muted/60 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest shadow-sm"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pb-1 sm:pb-0 shrink-0">
                    {["All", "Occupied", "Reserved", "Vacant", "Maintenance"].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={`rounded-xl px-2.5 py-1.5 font-mono-brand text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${selectedStatus === status
                            ? "bg-forest text-white shadow-sm"
                            : "border border-line bg-paper-card text-muted hover:bg-line/30 hover:text-ink"
                          }`}
                      >
                        {status === "All" ? "Lahat" : status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line p-8 text-center bg-paper-card">
                  <div className="mb-2 rounded-xl bg-forest/5 p-3 text-forest">
                    <Building2 className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <p className="font-display text-sm font-bold text-forest-deep">Walang Nakitang Bed</p>
                  <p className="mt-1 text-xs text-muted">Walang bed na tumutugma sa iyong hinahanap o naka-filter.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {currentRooms.map((room) => (
                      <div
                        key={room.id}
                        className="flex flex-col justify-between rounded-2xl border border-line/80 bg-paper p-3.5 space-y-3 shadow-sm transition-all hover:-translate-y-0.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-forest-deep text-xs sm:text-sm">
                            {room.roomNumber}
                          </span>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 font-mono-brand text-[10px] font-bold ${getStatusBadge(
                              room.status
                            )}`}
                          >
                            {room.status}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1.5 pt-1.5 border-t border-line/40">
                          <div className="flex items-center gap-1.5 text-muted text-[11px]">
                            {room.tenantName ? (
                              <>
                                <User className="h-3.5 w-3.5 shrink-0 text-muted/70" />
                                <span className="truncate">{room.tenantName}</span>
                              </>
                            ) : (
                              <span>Walang Tenant</span>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[10px] text-muted font-mono-brand uppercase tracking-wide">Buwanang Renta:</span>
                            <span className="font-bold text-forest-deep">
                              ₱{room.monthlyRent.toLocaleString()}/mo
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-paper px-4 py-2.5 shadow-sm">
                      <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className={`group flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono-brand text-[11px] font-bold transition-all cursor-pointer ${currentPage === 1
                            ? "cursor-not-allowed opacity-40 bg-line/20 text-muted"
                            : "bg-forest/10 text-forest hover:bg-forest hover:text-white active:scale-95"
                          }`}
                      >
                        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" /> Nakaraan
                      </button>

                      <div className="flex items-center gap-2 font-mono-brand text-[11px] font-bold text-forest-deep">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-forest text-white shadow-sm">
                          {currentPage}
                        </span>
                        <span className="text-muted">ng</span>
                        <span className="rounded-md bg-line/40 px-2 py-0.5 text-ink">{totalPages}</span>
                      </div>

                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className={`group flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono-brand text-[11px] font-bold transition-all cursor-pointer ${currentPage === totalPages
                            ? "cursor-not-allowed opacity-40 bg-line/20 text-muted"
                            : "bg-forest/10 text-forest hover:bg-forest hover:text-white active:scale-95"
                          }`}
                      >
                        Susunod <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Details Modal Component */}
      <UnitDetailsModal
        isOpen={isDetailsModalOpen}
        unit={unit}
        onClose={() => setIsDetailsModalOpen(false)}
        onOpenAddRoom={onOpenAddRoom}
        onOpenEditUnit={onOpenEditUnit}
      />
    </>
  );
}