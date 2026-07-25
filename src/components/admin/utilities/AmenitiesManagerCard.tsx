"use client";

import { useState, useMemo, useEffect } from "react";

interface AmenityItem {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  description?: string;
}

interface AmenitiesManagerCardProps {
  amenities: AmenityItem[];
  onDelete: (id: string) => void;
}

export function AmenitiesManagerCard({ amenities, onDelete }: AmenitiesManagerCardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4); // 4 kapag mobile, 6 kapag desktop

  // I-detect ang screen size para sa responsive items per page
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) { // sm breakpoint (640px)
        setItemsPerPage(6);
      } else {
        setItemsPerPage(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // I-extract ang mga natatanging frequency para sa filter buttons galing sa amenities data
  const frequencies = useMemo(() => {
    const unique = Array.from(new Set(amenities.map((item) => item.frequency)));
    return ["All", ...unique];
  }, [amenities]);

  // I-filter ang amenities batay sa search query at napiling frequency
  const filteredAmenities = useMemo(() => {
    return amenities.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (selectedFrequency === "All") return matchesSearch;
      return matchesSearch && item.frequency === selectedFrequency;
    });
  }, [amenities, searchQuery, selectedFrequency]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAmenities.length / itemsPerPage);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFrequencyChange = (freq: string) => {
    setSelectedFrequency(freq);
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAmenities = filteredAmenities.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-line bg-paper-card p-4 shadow-sm">
        <h4 className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
          Amenities Listahan ({filteredAmenities.length})
        </h4>

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
              placeholder="Hanapin ang amenity..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full sm:w-52 rounded-xl border border-line bg-paper-card py-1.5 pl-8 pr-3 font-mono-brand text-[11px] text-ink placeholder:text-muted/60 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest shadow-sm"
            />
          </div>

          {/* Frequency Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {frequencies.map((freq) => (
              <button
                key={freq}
                onClick={() => handleFrequencyChange(freq)}
                className={`rounded-xl px-2.5 py-1.5 font-mono-brand text-[10px] font-bold transition-all whitespace-nowrap ${
                  selectedFrequency === freq
                    ? "bg-forest text-white shadow-sm"
                    : "border border-line bg-paper-card text-muted hover:bg-line/30 hover:text-ink"
                }`}
              >
                {freq === "All" ? "Lahat" : freq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content / Grid */}
      {filteredAmenities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-paper-card p-8 text-center shadow-sm">
          <div className="mb-2 rounded-xl bg-forest/5 p-3 text-forest">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="font-display text-sm font-bold text-forest-deep">Walang Nakitang Amenity</p>
          <p className="mt-1 text-xs text-muted">Wala pang nakalagay o walang tumutugma sa iyong hinahanap / filter.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {currentAmenities.map((item) => (
              <div key={item.id} className="relative flex flex-col justify-between rounded-2xl border border-line bg-paper-card p-4 shadow-sm space-y-3 transition-all hover:-translate-y-0.5">
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-forest-deep text-sm">{item.name}</h3>
                    <span className="rounded-full bg-forest/10 px-2.5 py-0.5 font-mono-brand text-[10px] font-bold text-forest">
                      {item.frequency}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted mt-1">{item.description}</p>
                  )}
                </div>

                <div className="flex items-end justify-between pt-2 border-t border-line/60">
                  <div>
                    <span className="text-[10px] text-muted block">Halaga</span>
                    <span className="font-display text-lg font-black text-forest-deep">
                      ₱{item.amount.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 font-mono-brand text-[10px] font-bold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Tanggalin
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Playful Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-2xl border border-line bg-paper-card px-4 sm:px-6 py-3 shadow-sm">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`group flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 font-mono-brand text-xs font-bold transition-all ${
                  currentPage === 1
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
                className={`group flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 font-mono-brand text-xs font-bold transition-all ${
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
  );
}