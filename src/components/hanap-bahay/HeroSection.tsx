"use client";

import { useState, SubmitEvent } from "react";
import { Search, MapPin, Home, Sparkles, ChevronDown, ShieldCheck, Flame, Compass } from "lucide-react";
import { STATS, POPULAR_CITIES, BUDGET_OPTIONS, TYPE_OPTIONS, FullHouseIllustration } from "./HeroSectionContent";

interface HeroSectionProps {
    onSearchSubmit: (location: string, budget: string, type: string) => void;
    onLocationClick: (city: string) => void;
}

export function HeroSection({ onSearchSubmit, onLocationClick }: HeroSectionProps) {
    const [location, setLocation] = useState("");
    const [budget, setBudget] = useState("");
    const [type, setType] = useState("");
    const [activeTab, setActiveTab] = useState<"rent" | "explore">("rent");

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSearchSubmit(location, budget, type);
    };

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF8] via-[#FAF7EF] to-[#F5EFE6] pt-12 pb-20 lg:pt-20 lg:pb-28">
            {/* Background Decorative Blobs */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-32 -right-32 h-[550px] w-[550px] rounded-full bg-[#FADA7A]/20 blur-3xl animate-pulse" />
                <div className="absolute top-1/3 -left-32 h-[480px] w-[480px] rounded-full bg-[#1F4B3F]/10 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-[350px] w-[350px] rounded-full bg-[#D98F1E]/10 blur-2xl" />
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* Top Announcement / Trust Badge */}
                <div className="flex justify-center lg:justify-start mb-6">
                    <div className="inline-flex items-center gap-2.5 rounded-full border border-[#153730]/15 bg-white/80 backdrop-blur-md px-4 py-1.5 shadow-[0_4px_20px_rgba(21,55,48,0.06)] transition-transform hover:scale-105 cursor-default">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F0A93A]/20 text-[#D98F1E]">
                            <Sparkles className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#153730]">
                            Pilipinas Premier Rental Marketplace
                        </span>
                        <span className="ml-1 rounded-full bg-[#153730] px-2 py-0.5 text-[10px] font-extrabold text-[#FADA7A]">
                            NEW
                        </span>
                    </div>
                </div>

                {/* Main Hero Grid */}
                <div className="grid lg:grid-cols-12 lg:gap-12 items-center">

                    {/* Left Column: Headline & Value Proposition */}
                    <div className="lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-left z-10">
                        <h1 className="font-display font-black tracking-tight text-[#153730] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.12]">
                            Tuklasin ang <br className="hidden sm:inline" />
                            perpektong <br />
                            <span className="relative inline-block text-[#D98F1E]">
                                tahanan mo
                                <span className="absolute -bottom-2 left-0 w-full h-3 bg-[#FADA7A]/60 -z-10 rounded-full transform -rotate-1" />
                            </span>
                        </h1>

                        <p className="mt-6 max-w-xl text-base sm:text-lg text-[#6B7B74] leading-relaxed">
                            Mag-browse sa daan-daang <strong className="font-bold text-[#153730]">beripikadong paupahan</strong> buong Pilipinas. Direktang kumonekta sa mga may-ari nang walang hassle at may kumpletong kapayapaan ng isip.
                        </p>

                        {/* Quick Interactive Mode Switcher */}
                        <div className="mt-8 flex items-center gap-3 p-1 rounded-2xl bg-white/70 border border-[#E4DDC9] backdrop-blur-sm shadow-sm">
                            <button
                                type="button"
                                onClick={() => setActiveTab("rent")}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "rent"
                                    ? "bg-[#153730] text-white shadow-md scale-105"
                                    : "text-[#6B7B74] hover:text-[#153730]"
                                    }`}
                            >
                                <Home className="h-4 w-4" />
                                Maghanap ng Paupahan
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("explore")}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "explore"
                                    ? "bg-[#153730] text-white shadow-md scale-105"
                                    : "text-[#6B7B74] hover:text-[#153730]"
                                    }`}
                            >
                                <Compass className="h-4 w-4" />
                                Galugarin ang mga Lungsod
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Premium Immersive Illustration */}
                    <div className="lg:col-span-5 relative mt-10 lg:mt-0 flex items-center justify-center">
                        <div className="relative w-full max-w-[420px] aspect-square rounded-3xl bg-gradient-to-br from-white/80 to-[#FFFDF8] border border-[#E4DDC9] shadow-[0_20px_50px_rgba(21,55,48,0.08)] p-6 flex flex-col items-center justify-center overflow-hidden group">

                            {/* Floating Card Badge 1 */}
                            <div className="absolute top-4 left-4 flex items-center gap-2 rounded-2xl bg-white/90 backdrop-blur-md px-3.5 py-2 border border-[#E4DDC9] shadow-md animate-bounce duration-1000">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold">
                                    <ShieldCheck className="h-4 w-4" />
                                </span>
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-[#6B7B74] uppercase">Status</p>
                                    <p className="text-xs font-black text-[#153730]">100% Verified</p>
                                </div>
                            </div>

                            {/* Floating Card Badge 2 */}
                            <div className="absolute bottom-6 right-4 flex items-center gap-2 rounded-2xl bg-white/90 backdrop-blur-md px-3.5 py-2 border border-[#E4DDC9] shadow-md">
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FADA7A]/50 text-[#153730] font-bold">
                                    <Flame className="h-4 w-4 text-[#D98F1E]" />
                                </span>
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-[#6B7B74] uppercase">Trending</p>
                                    <p className="text-xs font-black text-[#153730]">Hot Deal Areas</p>
                                </div>
                            </div>

                            {/* Central Illustration SVG / Graphic Representation */}
                            <div className="w-full h-full flex items-center justify-center">
                                <FullHouseIllustration />
                            </div>
                        </div>
                    </div>

                </div>

                {/* ── Immersive Search Card Widget ── */}
                <form
                    onSubmit={handleSubmit}
                    className="mt-12 lg:mt-16 w-full rounded-3xl bg-white/90 backdrop-blur-xl p-3 sm:p-4 shadow-[0_15px_40px_rgba(21,55,48,0.12)] border border-[#E4DDC9] grid grid-cols-1 lg:grid-cols-12 gap-3 items-center transition-all hover:shadow-[0_20px_50px_rgba(21,55,48,0.18)]"
                >
                    {/* Location Field */}
                    <div className="lg:col-span-4 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#FAF7EF] border border-transparent hover:border-[#153730]/20 transition-all focus-within:bg-white focus-within:border-[#153730] focus-within:shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FADA7A]/40 text-[#153730]">
                            <MapPin className="h-5 w-5 text-[#D98F1E]" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <label htmlFor="hero-location" className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6B7B74]">
                                Lokasyon / Lungsod
                            </label>
                            <input
                                id="hero-location"
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Hal. Quezon City, Manila..."
                                className="w-full bg-transparent text-sm font-bold text-[#153730] placeholder:text-[#A8B0AB] outline-none"
                            />
                        </div>
                    </div>

                    {/* Property Type Field */}
                    <div className="lg:col-span-3 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#FAF7EF] border border-transparent hover:border-[#153730]/20 transition-all focus-within:bg-white focus-within:border-[#153730] focus-within:shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#153730]/10 text-[#153730]">
                            <Home className="h-5 w-5 text-[#1F4B3F]" />
                        </div>
                        <div className="flex-1 min-w-0 text-left relative">
                            <label htmlFor="hero-type" className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6B7B74]">
                                Uri ng Ari-arian
                            </label>
                            <select
                                id="hero-type"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full appearance-none bg-transparent text-sm font-bold text-[#153730] outline-none pr-6 cursor-pointer"
                            >
                                {TYPE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="h-4 w-4 absolute right-0 top-1/2 -translate-y-1/2 text-[#6B7B74] pointer-events-none" />
                        </div>
                    </div>

                    {/* Budget Range Field */}
                    <div className="lg:col-span-3 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#FAF7EF] border border-transparent hover:border-[#153730]/20 transition-all focus-within:bg-white focus-within:border-[#153730] focus-within:shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FADA7A]/40 text-[#D98F1E]">
                            <span className="font-black text-base">₱</span>
                        </div>
                        <div className="flex-1 min-w-0 text-left relative">
                            <label htmlFor="hero-budget" className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6B7B74]">
                                Budget bawat buwan
                            </label>
                            <select
                                id="hero-budget"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                className="w-full appearance-none bg-transparent text-sm font-bold text-[#153730] outline-none pr-6 cursor-pointer"
                            >
                                {BUDGET_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="h-4 w-4 absolute right-0 top-1/2 -translate-y-1/2 text-[#6B7B74] pointer-events-none" />
                        </div>
                    </div>

                    {/* Search CTA Button */}
                    <div className="lg:col-span-2">
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[#153730] py-4 text-sm font-black text-white shadow-lg shadow-[#153730]/20 transition-all hover:bg-[#1F4B3F] hover:shadow-xl active:scale-[0.98]"
                        >
                            <Search className="h-4 w-4 text-[#FADA7A]" />
                            <span>Maghanap</span>
                        </button>
                    </div>
                </form>

                {/* ── Popular Cities Chips / Quick Tags ── */}
                <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                    <span className="text-xs font-bold text-[#6B7B74] uppercase tracking-wide mr-2">Sikat na Lungsod:</span>
                    {POPULAR_CITIES.map((city) => (
                        <button
                            key={city.name}
                            type="button"
                            onClick={() => onLocationClick(city.name)}
                            className="group flex items-center gap-1.5 rounded-full border border-[#E4DDC9] bg-white px-4 py-2 text-xs font-extrabold text-[#153730] shadow-sm transition-all hover:border-[#153730] hover:bg-[#153730] hover:text-white hover:scale-105"
                        >
                            <span>{city.icon}</span>
                            <span>{city.name}</span>
                        </button>
                    ))}
                </div>

                {/* ── Statistics Bar ── */}
                <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {STATS.map((stat, i) => (
                        <div key={i} className="flex items-center gap-4 rounded-2xl border border-[#E4DDC9] bg-white/60 backdrop-blur-md p-5 shadow-sm transition-transform hover:-translate-y-1">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#153730]/10 text-[#153730]">
                                <stat.icon className="h-6 w-6 text-[#153730]" />
                            </div>
                            <div className="text-left">
                                <div className="font-display text-2xl font-black text-[#153730]">
                                    {stat.value}
                                </div>
                                <div className="text-xs font-bold text-[#6B7B74]">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}