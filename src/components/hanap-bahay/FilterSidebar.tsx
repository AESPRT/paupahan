// ==========================================
// 7. FILTER SIDEBAR COMPONENT (components/hanap-bahay/FilterSidebar.tsx)
// ==========================================
"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { SearchFiltersState } from "@/src/types/property";

interface FilterSidebarProps {
    filters: SearchFiltersState;
    onFilterChange: (newFilters: SearchFiltersState) => void;
    isOpenMobile: boolean;
    onCloseMobile: () => void;
}

export function FilterSidebar({ filters, onFilterChange, isOpenMobile, onCloseMobile }: FilterSidebarProps) {
    const [localFilters, setLocalFilters] = useState<SearchFiltersState>(filters);

    const handleApply = () => {
        onFilterChange(localFilters);
        onCloseMobile();
    };

    const handleReset = () => {
        const defaultFilters: SearchFiltersState = {
            location: "",
            city: "",
            priceRange: [0, 50000],
            propertyType: "",
            availability: "",
            amenities: [],
            sort: "newest",
        };
        setLocalFilters(defaultFilters);
        onFilterChange(defaultFilters);
    };

    const content = (
        <div className="flex flex-col h-full bg-white rounded-3xl border border-[#E4DDC9] p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#E4DDC9] mb-6">
                <div className="flex items-center gap-2 font-display text-lg font-extrabold text-[#153730]">
                    <SlidersHorizontal className="h-5 w-5 text-[#D98F1E]" />
                    <span>Salain ang Resulta</span>
                </div>
                <button onClick={handleReset} className="text-xs font-bold text-[#D98F1E] hover:underline">
                    I-reset Lahat
                </button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-1">
                {/* City Filter */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7B74] mb-2">Lungsod</label>
                    <select
                        value={localFilters.city}
                        onChange={(e) => setLocalFilters({ ...localFilters, city: e.target.value })}
                        className="w-full rounded-xl border border-[#E4DDC9] bg-[#FAF7EF] p-3 text-sm font-semibold text-[#153730] focus:outline-none"
                    >
                        <option value="">Lahat ng Lungsod</option>
                        <option value="Quezon City">Quezon City</option>
                        <option value="Manila">Manila</option>
                        <option value="Pasig">Pasig</option>
                        <option value="Makati">Makati</option>
                    </select>
                </div>

                {/* Property Type Filter */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7B74] mb-2">Uri ng Tahanan</label>
                    <select
                        value={localFilters.propertyType}
                        onChange={(e) => setLocalFilters({ ...localFilters, propertyType: e.target.value })}
                        className="w-full rounded-xl border border-[#E4DDC9] bg-[#FAF7EF] p-3 text-sm font-semibold text-[#153730] focus:outline-none"
                    >
                        <option value="">Lahat</option>
                        <option value="apartment">Apartment</option>
                        <option value="boarding_house">Boarding House</option>
                        <option value="solo_room">Solo Room</option>
                        <option value="student">Student Friendly</option>
                        <option value="family">Family Home</option>
                    </select>
                </div>

                {/* Max Price Range */}
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7B74] mb-2">
                        Max Badyet: ₱{localFilters.priceRange[1].toLocaleString()}
                    </label>
                    <input
                        type="range"
                        min="3000"
                        max="50000"
                        step="1000"
                        value={localFilters.priceRange[1]}
                        onChange={(e) => setLocalFilters({ ...localFilters, priceRange: [0, Number(e.target.value)] })}
                        className="w-full accent-[#1F4B3F]"
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-[#E4DDC9] mt-4">
                <button
                    onClick={handleApply}
                    className="w-full rounded-2xl bg-[#153730] py-3.5 font-display font-bold text-white shadow-md hover:bg-[#1F4B3F] transition-all"
                >
                    I-apply ang Salain
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-80 flex-shrink-0 sticky top-24 h-[calc(100vh-120px)]">
                {content}
            </aside>

            {/* Mobile Bottom Sheet Modal */}
            {isOpenMobile && (
                <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm lg:hidden">
                    <div className="w-full bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom">
                        <div className="flex items-center justify-between pb-4 border-b border-[#E4DDC9] mb-4">
                            <span className="font-display text-lg font-extrabold text-[#153730]">Salain</span>
                            <button onClick={onCloseMobile} className="p-1 rounded-full bg-[#FAF7EF]">
                                <X className="h-6 w-6 text-[#153730]" />
                            </button>
                        </div>
                        {content}
                    </div>
                </div>
            )}
        </>
    );
}