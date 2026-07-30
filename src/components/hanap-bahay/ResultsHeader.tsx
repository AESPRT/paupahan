"use client";

import { SlidersHorizontal, Sparkles } from "lucide-react";

interface ResultsHeaderProps {
    totalCount: number;
    sortOption: string;
    onSortChange: (sort: string) => void;
    onOpenMobileFilters: () => void;
}

export function ResultsHeader({ totalCount, sortOption, onSortChange, onOpenMobileFilters }: ResultsHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-5 w-5 text-[#D98F1E]" />
                    <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#153730]">
                        {totalCount} Tahanan ang Nahanap
                    </h2>
                </div>
                <p className="text-sm text-[#6B7B74]">Mag-explore at humanap ng babagay sa iyong badyet.</p>
            </div>

            <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <button
                    onClick={onOpenMobileFilters}
                    className="lg:hidden flex items-center gap-2 rounded-xl border border-[#E4DDC9] bg-white px-4 py-2.5 font-display text-xs font-bold text-[#153730] shadow-sm"
                >
                    <SlidersHorizontal className="h-4 w-4 text-[#D98F1E]" />
                    <span>Salain</span>
                </button>

                {/* Sort Dropdown */}
                <select
                    value={sortOption}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="rounded-xl border border-[#E4DDC9] bg-white px-4 py-2.5 font-display text-xs font-bold text-[#153730] shadow-sm focus:outline-none cursor-pointer"
                >
                    <option value="newest">Pinakabago</option>
                    <option value="price_asc">Presyo: Mababa hanggang Mataas</option>
                    <option value="price_desc">Presyo: Mataas hanggang Mababa</option>
                </select>
            </div>
        </div>
    );
}