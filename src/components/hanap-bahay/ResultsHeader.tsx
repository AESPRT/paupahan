// src/components/hanap-bahay/ResultsHeader.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, Sparkles, ChevronDown, Check } from "lucide-react";

interface ResultsHeaderProps {
    totalCount: number;
    sortOption: string;
    onSortChange: (sort: string) => void;
    onOpenMobileFilters: () => void;
}

const SORT_OPTIONS = [
    { label: "Pinakabago", value: "newest" },
    { label: "Presyo: Mababa hanggang Mataas", value: "price_asc" },
    { label: "Presyo: Mataas hanggang Mataas", value: "price_desc" },
];

export function ResultsHeader({ totalCount, sortOption, onSortChange, onOpenMobileFilters }: ResultsHeaderProps) {
    const [isOpenSort, setIsOpenSort] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);

    // Click outside para maisara ang custom dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setIsOpenSort(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedSortLabel = SORT_OPTIONS.find(opt => opt.value === sortOption)?.label || "Pinakabago";

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-5 w-5 text-[var(--marigold-deep)]" />
                    <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--forest-deep)]">
                        {totalCount} Tahanan ang Nahanap
                    </h2>
                </div>
                <p className="text-sm text-[var(--muted)]">Mag-explore at humanap ng babagay sa iyong badyet.</p>
            </div>

            <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <button
                    onClick={onOpenMobileFilters}
                    className="lg:hidden flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--paper-card)] px-4 py-2.5 font-display text-xs font-bold text-[var(--forest-deep)] shadow-sm hover:border-[var(--marigold)] transition-all"
                >
                    <SlidersHorizontal className="h-4 w-4 text-[var(--marigold-deep)]" />
                    <span>Salain</span>
                </button>

                {/* Modern Custom Sort Dropdown */}
                <div className="relative" ref={sortRef}>
                    <button
                        type="button"
                        onClick={() => setIsOpenSort(!isOpenSort)}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--paper-card)] px-4 py-2.5 font-display text-xs font-bold text-[var(--forest-deep)] shadow-sm hover:border-[var(--marigold)] transition-all outline-none min-w-[220px]"
                    >
                        <span className="truncate">{selectedSortLabel}</span>
                        <ChevronDown className={`h-4 w-4 text-[var(--muted)] transition-transform duration-300 flex-shrink-0 ${isOpenSort ? "rotate-180 text-[var(--marigold-deep)]" : ""}`} />
                    </button>

                    {isOpenSort && (
                        <div className="absolute right-0 z-30 top-full mt-2 w-full min-w-[240px] bg-[var(--paper-card)] border border-[var(--line)] rounded-2xl shadow-xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            {SORT_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onSortChange(option.value);
                                        setIsOpenSort(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold transition-colors text-left ${sortOption === option.value ? 'bg-[var(--forest-deep)] text-white' : 'text-[var(--forest-deep)] hover:bg-[var(--paper)]'}`}
                                >
                                    <span>{option.label}</span>
                                    {sortOption === option.value && <Check className="h-3.5 w-3.5 text-[var(--marigold)] flex-shrink-0 ml-2" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}