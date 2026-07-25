"use client";

import { useState, useMemo, useEffect } from "react";
import { Unit, Room } from "@/src/types/admin/unit";

interface UnitCardProps {
  unit: Unit;
  onOpenAddRoom: (unit: Unit) => void;
}

export function UnitCard({ unit, onOpenAddRoom }: UnitCardProps) {
  // State para sa Search, Status Filter, at Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4); // Default muna sa 4 (mobile view)

  // I-detect ang screen size para i-set ang itemsPerPage (4 para sa mobile, 9 para sa sm pataas)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) { // sm breakpoint sa Tailwind (640px)
        setItemsPerPage(9);
      } else {
        setItemsPerPage(4);
      }
    };

    // Set initial value
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getRoomBadge = (status: Room["status"]) => {
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

  // I-filter ang mga kwarto batay sa search query at status
  const filteredRooms = useMemo(() => {
    return unit.rooms.filter((room) => {
      const matchesSearch =
        room.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.tenantName?.toLowerCase().includes(searchQuery.toLowerCase());

      if (selectedStatus === "All") return matchesSearch;
      return matchesSearch && room.status === selectedStatus;
    });
  }, [unit.rooms, searchQuery, selectedStatus]);

  // Kalkulahin ang pagination mula sa na-filter na listahan ng mga kwarto
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
    <div className="rounded-3xl border border-line bg-paper-card p-5 shadow-sm transition-all hover:shadow-md space-y-4">
      {/* Header: Unit Info & Add Room Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line/60 pb-4">
        <div>
          <h3 className="font-display text-lg font-bold text-forest-deep">
            {unit.name}
          </h3>
          {/* Location / Address with Pin SVG Icon */}
          <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
            <svg className="h-3.5 w-3.5 shrink-0 text-muted/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{unit.address}</span>
          </div>
        </div>

        <button
          onClick={() => onOpenAddRoom(unit)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-forest/30 bg-forest/5 px-3.5 py-2 font-mono-brand text-xs font-bold text-forest hover:bg-forest hover:text-white transition-all self-start sm:self-auto shadow-sm"
        >
          {/* Plus / Add SVG Icon */}
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Magdagdag ng Kwarto</span>
        </button>
      </div>

      {/* Rooms Section Header & Controls (Search & Filters) */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            Mga Kwarto ({filteredRooms.length})
          </h4>

          {/* Playful Search & Status Filters */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted pointer-events-none">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Hanapin ang kwarto o tenant..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full sm:w-52 rounded-xl border border-line bg-paper-card py-1.5 pl-8 pr-3 font-mono-brand text-[11px] text-ink placeholder:text-muted/60 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest shadow-sm"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {["All", "Occupied", "Reserved", "Vacant", "Maintenance"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`rounded-xl px-2.5 py-1.5 font-mono-brand text-[10px] font-bold transition-all ${
                    selectedStatus === status
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
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="font-display text-sm font-bold text-forest-deep">Walang Nakitang Kwarto</p>
            <p className="mt-1 text-xs text-muted">Walang kwarto na tumutugma sa iyong hinahanap o naka-filter.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {currentRooms.map((room) => (
                <div
                  key={room.id}
                  className="flex flex-col justify-between rounded-2xl border border-line/80 bg-paper p-3.5 space-y-2 shadow-sm transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-forest-deep text-xs sm:text-sm">
                      {room.roomNumber}
                    </span>
                    <span
                      className={`rounded-md border px-2 py-0.5 font-mono-brand text-[10px] font-bold ${getRoomBadge(
                        room.status
                      )}`}
                    >
                      {room.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-line/40">
                    <div className="flex items-center gap-1.5 text-muted text-[11px]">
                      {room.tenantName ? (
                        <>
                          {/* User SVG Icon */}
                          <svg className="h-3.5 w-3.5 shrink-0 text-muted/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="truncate max-w-[110px]">{room.tenantName}</span>
                        </>
                      ) : (
                        <span>Walang Tenant</span>
                      )}
                    </div>
                    <span className="font-bold text-forest-deep">
                      ₱{room.monthlyRent.toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Playful Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-paper px-4 py-2.5 shadow-sm">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`group flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono-brand text-[11px] font-bold transition-all ${
                    currentPage === 1
                      ? "cursor-not-allowed opacity-40 bg-line/20 text-muted"
                      : "bg-forest/10 text-forest hover:bg-forest hover:text-white active:scale-95"
                  }`}
                >
                  <span className="transition-transform group-hover:-translate-x-0.5">←</span> Nakaraan
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
                  className={`group flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono-brand text-[11px] font-bold transition-all ${
                    currentPage === totalPages
                      ? "cursor-not-allowed opacity-40 bg-line/20 text-muted"
                      : "bg-forest/10 text-forest hover:bg-forest hover:text-white active:scale-95"
                  }`}
                >
                  Susunod <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}