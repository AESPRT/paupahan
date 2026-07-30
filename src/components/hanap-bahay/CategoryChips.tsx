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
    Snowflake
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
        <div className="relative border-y border-[#E4DDC9] bg-[#FFFDF8] py-4 shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    {/* Scroll Left Button */}
                    <button
                        onClick={() => scroll("left")}
                        className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-[#E4DDC9] bg-white text-[#153730] hover:bg-[#FAF7EF] shadow-sm transition-all"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    {/* Chips Container */}
                    <div
                        ref={scrollRef}
                        className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1"
                    >
                        {CATEGORIES.map((cat) => {
                            const isSelected = selectedCategory === cat.id;
                            const IconComponent = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => onSelectCategory(cat.id)}
                                    className={`flex items-center gap-2 whitespace-nowrap rounded-2xl px-5 py-3 font-display text-sm font-bold transition-all duration-200 shadow-sm ${isSelected
                                            ? "bg-[#153730] text-[#FAF7EF] scale-105 shadow-md"
                                            : "border border-[#E4DDC9] bg-white text-[#153730] hover:border-[#1F4B3F] hover:bg-[#FAF7EF]"
                                        }`}
                                >
                                    <IconComponent className={`h-4 w-4 ${isSelected ? "text-[#F0A93A]" : "text-[#1F4B3F]"}`} />
                                    <span>{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Scroll Right Button */}
                    <button
                        onClick={() => scroll("right")}
                        className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-[#E4DDC9] bg-white text-[#153730] hover:bg-[#FAF7EF] shadow-sm transition-all"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}