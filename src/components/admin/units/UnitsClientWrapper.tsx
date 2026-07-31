"use client";

import { useState, useMemo } from "react";
import { Unit, Room, UnitType, UnitFloor } from "@/src/types/admin/unit";
import { UnitsHeader } from "./UnitsHeader";
import { UnitCard } from "./UnitCard";
import { AddRoomModal } from "./AddRoomModal";
import { AddUnitModal } from "./AddUnitModal";
import { EditUnitModal } from "@/src/components/admin/units/EditUnitModal";
import { Footer } from "@/src/components/landing/Footer";
import { addRoomAction, addUnitAction } from "@/src/actions/units-actions";

interface UnitsClientWrapperProps {
  initialUnits: Unit[];
}

export default function UnitsClientWrapper({
  initialUnits
}: UnitsClientWrapperProps) {
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [selectedUnitForRoom, setSelectedUnitForRoom] = useState<Unit | null>(null);
  const [selectedUnitForEdit, setSelectedUnitForEdit] = useState<Unit | null>(null);
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const totalUnits = units.length;
  const allRooms = units.flatMap((u) => u.rooms || []);
  const totalRooms = allRooms.length;
  const vacantRooms = allRooms.filter((r) => r.status === "Vacant").length;

  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const matchesSearch =
        unit.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.address?.toLowerCase().includes(searchQuery.toLowerCase());

      if (selectedFilter === "All") return matchesSearch;

      if (selectedFilter === "Has Vacant") {
        const hasVacantRoom = unit.rooms?.some((r) => r.status === "Vacant");
        return matchesSearch && hasVacantRoom;
      }
      if (selectedFilter === "Full") {
        const isFull = unit.rooms?.length > 0 && unit.rooms?.every((r) => r.status === "Occupied");
        return matchesSearch && isFull;
      }

      return matchesSearch;
    });
  }, [units, searchQuery, selectedFilter]);

  const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUnits = filteredUnits.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleAddRoom = async (newRoomData: Omit<Room, "id">) => {
    if (!selectedUnitForRoom) return;

    const result = await addRoomAction(
      selectedUnitForRoom.id,
      newRoomData.roomNumber,
      Number(newRoomData.monthlyRent)
    );

    if (result.success) {
      setUnits((prevUnits) =>
        prevUnits.map((unit) => {
          if (unit.id === selectedUnitForRoom.id) {
            const newRoom: Room = {
              id: Date.now().toString(),
              roomNumber: newRoomData.roomNumber,
              status: "Vacant" as const,
              monthlyRent: Number(newRoomData.monthlyRent),
            };
            return {
              ...unit,
              totalRooms: (unit.rooms || []).length + 1,
              rooms: [...(unit.rooms || []), newRoom],
            };
          }
          return unit;
        })
      );

      setSelectedUnitForRoom(null);
    } else {
      alert(result.error);
    }
  };

  // 👈 In-update para tanggapin at i-save ang floor at type
  const handleAddUnit = async (unitData: {
    unitName: string;
    monthlyRent: number;
    floor: UnitFloor;
    type: UnitType;
  }) => {
    const result = await addUnitAction(unitData);

    if (result.success && result.unit) {
      // 👈 Siguraduhing may fallback string para sa address
      const propertyAddress = result.unit.property?.addressLine
        ? `${result.unit.property.addressLine}${result.unit.property.city ? `, ${result.unit.property.city}` : ""}`
        : "Pangunahing Lokasyon";

      const newUnit: Unit = {
        id: result.unit.id,
        name: result.unit.name,
        address: propertyAddress, // 👈 TypeScript safe (Laging string ito)
        totalRooms: 0,
        rooms: [],
        monthlyRent: Number(result.unit.monthlyRent || unitData.monthlyRent || 0),
        floor: (result.unit.floor as UnitFloor) || unitData.floor,
        type: (result.unit.type as UnitType) || unitData.type,
      };

      setUnits((prev) => [newUnit, ...prev]);
      setIsAddUnitOpen(false);
      setCurrentPage(1);
    } else {
      alert(result.error || "May error sa pag-add ng unit.");
    }
  };

  const handleUpdateUnit = (updatedUnitData: Unit) => {
    setUnits((prevUnits) =>
      prevUnits.map((unit) => (unit.id === updatedUnitData.id ? updatedUnitData : unit))
    );
    setSelectedUnitForEdit(null);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <UnitsHeader
        totalUnits={totalUnits}
        totalRooms={totalRooms}
        vacantRooms={vacantRooms}
        onAddUnit={() => setIsAddUnitOpen(true)}
      />

      {/* Units Search & Filter Controls Section */}
      <div className="flex flex-col gap-4 rounded-2xl border border-line/60 bg-paper-card p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between">
        <h2 className="font-mono-brand text-xs font-bold uppercase tracking-wider text-muted shrink-0">
          Mga Nakarehistrong Unit ({filteredUnits.length})
        </h2>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full xl:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Hanapin ang unit o address..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full rounded-xl border border-line bg-paper py-2 pl-9 pr-4 font-mono-brand text-xs text-ink placeholder:text-muted/60 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest shadow-sm"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0">
            {[
              { label: "Lahat", value: "All" },
              { label: "May Vacant", value: "Has Vacant" },
              { label: "Puno (Full)", value: "Full" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleFilterChange(filter.value)}
                className={`rounded-xl px-3.5 py-2 font-mono-brand text-[11px] font-bold transition-all whitespace-nowrap shadow-sm cursor-pointer ${selectedFilter === filter.value
                  ? "bg-forest text-white"
                  : "border border-line bg-paper text-muted hover:bg-line/30 hover:text-ink"
                  }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List of Units o Empty State */}
      <div className="space-y-6">
        {filteredUnits.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {currentUnits.map((unit) => (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  onOpenAddRoom={(unitToEdit) => setSelectedUnitForRoom(unitToEdit)}
                  onOpenEditUnit={(unitToEdit) => setSelectedUnitForEdit(unitToEdit)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between rounded-2xl border border-line bg-paper-card px-6 py-4 shadow-sm">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`group flex items-center gap-2 rounded-xl px-4 py-2 font-mono-brand text-xs font-bold transition-all cursor-pointer ${currentPage === 1
                    ? "cursor-not-allowed opacity-40 bg-line/20 text-muted"
                    : "bg-forest/10 text-forest hover:bg-forest hover:text-white active:scale-95"
                    }`}
                >
                  <span className="transition-transform group-hover:-translate-x-0.5">←</span> Nakaraan
                </button>

                <div className="flex items-center gap-2 font-mono-brand text-xs font-bold text-forest-deep">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest text-white shadow-sm">
                    {currentPage}
                  </span>
                  <span className="text-muted">ng</span>
                  <span className="rounded-lg bg-line/40 px-2 py-1 text-ink">{totalPages}</span>
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`group flex items-center gap-2 rounded-xl px-4 py-2 font-mono-brand text-xs font-bold transition-all cursor-pointer ${currentPage === totalPages
                    ? "cursor-not-allowed opacity-40 bg-line/20 text-muted"
                    : "bg-forest/10 text-forest hover:bg-forest hover:text-white active:scale-95"
                    }`}
                >
                  Susunod <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-line bg-paper-card p-12 text-center shadow-sm">
            <div className="mb-3 flex justify-center text-forest">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="font-display text-base font-bold text-forest-deep">
              Walang Nakitang Unit
            </h3>
            <p className="mt-1 text-xs text-muted">Walang unit o property na tumutugma sa iyong hinahanap.</p>
          </div>
        )}
      </div>

      {/* Add Room Modal Dialog */}
      <AddRoomModal
        isOpen={!!selectedUnitForRoom}
        unitName={selectedUnitForRoom?.name || ""}
        onClose={() => setSelectedUnitForRoom(null)}
        onAddRoom={handleAddRoom}
      />

      {/* Add Unit Modal Dialog */}
      <AddUnitModal
        isOpen={isAddUnitOpen}
        propertyName={units[0]?.name || "Pangunahing Property"}
        onClose={() => setIsAddUnitOpen(false)}
        onAddUnit={handleAddUnit}
      />

      {/* Edit Unit Modal Dialog */}
      {selectedUnitForEdit && (
        <EditUnitModal
          isOpen={!!selectedUnitForEdit}
          unit={selectedUnitForEdit}
          onClose={() => setSelectedUnitForEdit(null)}
          onUpdateUnit={handleUpdateUnit}
        />
      )}

      <Footer showNavLinks={false} />
    </div>
  );
}