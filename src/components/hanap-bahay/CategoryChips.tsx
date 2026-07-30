"use client";

import { useRef } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Building2,
    Home,
    BedDouble,
    GraduationCap,
    Users,
    Dog,
    Car,
    Wifi,
    Snowflake,
} from "lucide-react";

interface CategoryChipsProps {
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

const CATEGORIES = [
    { id: "all", label: "Lahat", icon: Sparkles },
    { id: "apartment", label: "Apartment", icon: Building2 },
    { id: "boarding_house", label: "Boarding House", icon: Home },
    { id: "solo_room", label: "Solo Room", icon: BedDouble },
    { id: "student", label: "Student Friendly", icon: GraduationCap },
    { id: "family", label: "Family", icon: Users },
    { id: "pets", label: "Pets Allowed", icon: Dog },
    { id: "parking", label: "Parking", icon: Car },
    { id: "wifi", label: "WiFi", icon: Wifi },
    { id: "aircon", label: "Aircon", icon: Snowflake },
];

export function CategoryChips({ selectedCategory, onSelectCategory }: CategoryChipsProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const offset = direction === "left" ? -clientWidth / 2 : clientWidth / 2;
            scrollRef.current.scrollTo({ left: scrollLeft + offset, behavior: "smooth" });
        }
    };

    return (
        <div className="relative w-full">
            <div className="flex items-center gap-1.5 relative">
                {/* Scroll Left Button */}
                <button
                    onClick={() => scroll("left")}
                    className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E4DDC9] bg-white text-[#6B7B74] shadow-sm hover:bg-[#153730] hover:text-white hover:border-[#153730] transition-all"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Chips Container */}
                <div
                    ref={scrollRef}
                    className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5 w-full"
                >
                    {CATEGORIES.map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        const Icon = cat.icon;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => onSelectCategory(cat.id)}
                                aria-pressed={isSelected}
                                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                                    isSelected
                                        ? "bg-[#153730] text-white border-[#153730] shadow-md shadow-[#153730]/15 scale-[1.02]"
                                        : "bg-white text-[#4B5750] border-[#E4DDC9]/80 hover:border-[#153730]/30 hover:bg-[#FAF7EF]"
                                }`}
                            >
                                <Icon className={`h-3.5 w-3.5 transition-colors ${isSelected ? "text-[#FADA7A]" : "text-[#8A9A93]"}`} />
                                <span>{cat.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Scroll Right Button */}
                <button
                    onClick={() => scroll("right")}
                    className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E4DDC9] bg-white text-[#6B7B74] shadow-sm hover:bg-[#153730] hover:text-white hover:border-[#153730] transition-all"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}