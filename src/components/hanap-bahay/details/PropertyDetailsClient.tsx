"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AvailableUnitsList } from "@/src/components/hanap-bahay/details/AvailableUnitsList";
import { BookViewingModal } from "@/src/components/hanap-bahay/details/BookViewingModal";
import {
    Sparkles,
    ShieldCheck,
    Wifi,
    Car,
    Tv,
    Coffee,
    Utensils,
    Wind,
    CheckCircle2,
    Home,
    Heart,
    Lock,
    Share2,
    Star,
    MapPin,
    Users,
    BedDouble,
    CalendarCheck,
    MessageCircle,
    FileCheck2,
    Banknote,
    Zap,
    ChevronRight,
} from "lucide-react";
import { Property } from "@/src/types/property";
import { UnitDetail } from "@/src/actions/hanap-bahay/property-details-action";

interface PropertyDetailsClientProps {
    property: Property;
    units: UnitDetail[];
}

/* ────────────────────────────────────────────────────────────
   Scroll-reveal wrapper — small IntersectionObserver hook so
   sections fade/slide in as the user scrolls. No extra
   dependency (no framer-motion) needed for this.
   ──────────────────────────────────────────────────────────── */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className="transition-all duration-700 ease-out"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(24px)",
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}

/* ────────────────────────────────────────────────────────────
   Amenity categorization — extends your existing icon lookup
   with a category so amenities can be grouped visually.
   ──────────────────────────────────────────────────────────── */
const AMENITY_CATEGORIES: Record<string, { icon: React.ElementType; label: string; color: string }> = {
    living: { icon: Home, label: "Living", color: "#1F4B3F" },
    connectivity: { icon: Wifi, label: "Connectivity", color: "#2563EB" },
    comfort: { icon: Wind, label: "Comfort", color: "#0891B2" },
    kitchen: { icon: Utensils, label: "Kitchen", color: "#D97706" },
    parking: { icon: Car, label: "Parking", color: "#7C3AED" },
    security: { icon: ShieldCheck, label: "Security", color: "#DC2626" },
};

function categorizeAmenity(amenity: string): keyof typeof AMENITY_CATEGORIES {
    const lower = amenity.toLowerCase();
    if (lower.includes("wifi") || lower.includes("internet")) return "connectivity";
    if (lower.includes("parking") || lower.includes("garage")) return "parking";
    if (lower.includes("kitchen") || lower.includes("luto")) return "kitchen";
    if (lower.includes("aircon") || lower.includes("ac") || lower.includes("air conditioning")) return "comfort";
    if (lower.includes("guard") || lower.includes("cctv") || lower.includes("gate") || lower.includes("lock")) return "security";
    return "living";
}

function getAmenityIcon(amenity: string) {
    const lower = amenity.toLowerCase();
    if (lower.includes("wifi") || lower.includes("internet")) return Wifi;
    if (lower.includes("parking") || lower.includes("garage")) return Car;
    if (lower.includes("tv") || lower.includes("netflix")) return Tv;
    if (lower.includes("coffee") || lower.includes("kape")) return Coffee;
    if (lower.includes("kitchen") || lower.includes("lutuan") || lower.includes("luto")) return Utensils;
    if (lower.includes("ac") || lower.includes("aircon") || lower.includes("air conditioning")) return Wind;
    return CheckCircle2;
}

/* Amenity → highlight chip icon reuses the same lookup as the amenity grid below. */
function typeLabel(type: string) {
    const map: Record<string, string> = {
        apartment: "Apartment",
        boarding_house: "Boarding House",
        solo_room: "Solo Room",
        condo: "Condo Unit",
        house: "Buong Bahay",
    };
    return map[type] ?? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Builds highlight chips entirely from real `property` fields — no
 * fabricated demographic guesses ("Best for Students", etc.) since
 * the Property model doesn't carry that data. Everything here traces
 * back to a field returned by getPropertyDetailsById.
 */
function buildHighlights(property: Property) {
    const chips: { icon: React.ElementType; label: string; color: string }[] = [];

    chips.push({ icon: Home, label: typeLabel(property.type), color: "#1F4B3F" });

    if (property.verifiedLandlord) {
        chips.push({ icon: ShieldCheck, label: "Beripikadong May-ari", color: "#2563EB" });
    }

    if (property.availableUnits > 0) {
        chips.push({ icon: BedDouble, label: `${property.availableUnits} Bakanteng Unit`, color: "#0891B2" });
    }

    if (property.addedTime === "today") {
        chips.push({ icon: Sparkles, label: "Bagong Idinagdag Ngayon", color: "#D97706" });
    } else if (property.addedTime === "yesterday") {
        chips.push({ icon: Sparkles, label: "Idinagdag Kahapon", color: "#D97706" });
    }

    // Feature up to two real amenities as chips instead of inventing content.
    property.amenities.slice(0, 2).forEach((amenity) => {
        chips.push({ icon: getAmenityIcon(amenity), label: amenity, color: "#7C3AED" });
    });

    return chips;
}

const TRUST_ITEMS = [
    { icon: ShieldCheck, label: "Reviewed Listing", desc: "Sinusuri namin bago mailathala sa marketplace" },
    { icon: Banknote, label: "Transparent Pricing", desc: "Ang presyong makikita mo ang babayaran mo" },
    { icon: Zap, label: "Fast Approval", desc: "Mabilis na proseso ng booking at kumpirmasyon" },
];

export function PropertyDetailsClient({ property, units }: PropertyDetailsClientProps) {
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [selectedBookingTarget, setSelectedBookingTarget] = useState<{ title: string; price: number; type: 'unit' | 'bed'; id: string } | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [ctaLoading, setCtaLoading] = useState(false);

    const handleSelectBookingTarget = (target: { title: string; price: number; type: 'unit' | 'bed'; id: string }) => {
        setSelectedBookingTarget(target);
        setIsBookingOpen(true);
    };

    const handlePrimaryBook = () => {
        setCtaLoading(true);
        window.setTimeout(() => {
            setCtaLoading(false);
            setIsBookingOpen(true);
        }, 500);
    };

    const vacantUnits = units.filter(u => u.status === "vacant");
    const totalBeds = units.reduce((acc, u) => acc + u.beds.length, 0);
    const occupancyPercent = units.length > 0
        ? Math.round(((units.length - vacantUnits.length) / units.length) * 100)
        : 0;

    const highlights = buildHighlights(property);

    const stats = [
        { icon: Home, value: String(units.length), label: "Kabuuang Unit" },
        { icon: BedDouble, value: String(totalBeds), label: "Kabuuang Kama" },
        { icon: Users, value: `${occupancyPercent}%`, label: "Naka-okupa" },
        { icon: ShieldCheck, value: property.verifiedLandlord ? "Oo" : "Hindi pa", label: "Beripikadong May-ari" },
    ];

    // Real cover photo from the server action — falls back to its own
    // Unsplash default when the landlord hasn't uploaded one yet.
    const heroImage = property.coverImage;

    return (
        <main className="min-h-screen bg-[#FAF7EF] pb-24 selection:bg-[#153730] selection:text-[#FAF7EF]">

            {/* ══════════════════════ HERO ══════════════════════ */}
            <section className="relative h-[52vh] min-h-[420px] max-h-[620px] w-full overflow-hidden">
                {heroImage ? (
                    <Image
                        src={heroImage}
                        alt={property.title}
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover scale-[1.02] animate-[hero-zoom_8s_ease-out_forwards]"
                    />
                ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,#153730,#1F4B3F_55%,#2A5A4A)]" />
                )}

                {/* Gradient overlay for legibility + a subtle animated sheen */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F241F]/90 via-[#0F241F]/20 to-[#0F241F]/10" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(240,169,58,0.10),transparent)] bg-[length:200%_100%] animate-[hero-sheen_6s_ease-in-out_infinite]" />

                {/* Top bar: breadcrumb + save/share */}
                <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 pt-6 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 rounded-full bg-black/25 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium text-white/90">
                        <Home className="h-3.5 w-3.5" />
                        <span>HanapBahay</span>
                        <ChevronRight className="h-3 w-3 text-white/50" />
                        <span className="font-semibold truncate max-w-[160px] sm:max-w-xs">{property.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsLiked(!isLiked)}
                            className="flex items-center justify-center h-9 w-9 rounded-full bg-black/25 backdrop-blur-md text-white hover:bg-black/40 transition-all hover:scale-110 active:scale-95"
                            aria-label="Save"
                        >
                            <Heart className={`h-4 w-4 transition-colors ${isLiked ? "fill-[#F0A93A] text-[#F0A93A]" : ""}`} />
                        </button>
                        <button
                            className="flex items-center justify-center h-9 w-9 rounded-full bg-black/25 backdrop-blur-md text-white hover:bg-black/40 transition-all hover:scale-110 active:scale-95"
                            aria-label="Share"
                        >
                            <Share2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Floating info card, anchored to bottom of hero */}
                <div
                    className="absolute inset-x-0 bottom-0 translate-y-1/2 z-10 opacity-0 animate-[hero-card-in_0.7s_0.2s_ease-out_forwards]"
                >
                    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                        <div className="rounded-3xl border border-[#E4DDC9] bg-[#FFFDF8]/95 backdrop-blur-xl shadow-[0_20px_50px_-10px_rgba(21,55,48,0.25)] p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-[#153730]/10 text-[#153730] px-2.5 py-1 text-[11px] font-bold">
                                            <MapPin className="h-3 w-3" />
                                            {property.city ?? "Pilipinas"}
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-[#8A5A0E] px-2.5 py-1 text-[11px] font-bold">
                                            <Star className="h-3 w-3 fill-current" />
                                            {property.status}
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1 text-[11px] font-bold">
                                            <BedDouble className="h-3 w-3" />
                                            {vacantUnits.length} bakante
                                        </span>
                                    </div>
                                    <h1 className="font-display text-2xl sm:text-3xl font-black text-[#153730] tracking-tight">
                                        {property.title}
                                    </h1>
                                </div>
                                <div className="text-left sm:text-right shrink-0">
                                    <span className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7B74]">Saklaw ng Renta</span>
                                    <span className="font-display text-xl sm:text-2xl font-black text-[#153730]">
                                        {typeof property.price === "number" ? `₱${property.price.toLocaleString()}` : property.price}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Spacer to account for the floating card's overhang */}
            <div className="h-24 sm:h-20" />

            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-6">

                {/* ══════════════════════ QUICK STATS ══════════════════════ */}
                <Reveal>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-2xl border border-[#E4DDC9] bg-[#FFFDF8] p-4 text-center transition-transform hover:-translate-y-1"
                            >
                                <stat.icon className="h-4 w-4 mx-auto text-[#D98F1E] mb-1.5" />
                                <div className="font-display text-lg font-black text-[#153730]">{stat.value}</div>
                                <div className="text-[10px] font-semibold text-[#6B7B74] uppercase tracking-wide">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                    {/* ══════════════════════ LEFT COLUMN ══════════════════════ */}
                    <div className="lg:col-span-8 space-y-10">

                        {/* About + Quick Highlights */}
                        <Reveal>
                            <div className="rounded-3xl border border-[#E4DDC9] bg-[#FFFDF8] p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FAF7EF] border border-[#E4DDC9]">
                                        <Sparkles className="h-5 w-5 text-[#D98F1E]" />
                                    </div>
                                    <div>
                                        <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#153730]">Tungkol sa Tahanang Ito</h2>
                                        <p className="text-xs text-[#6B7B74]">Idinisenyo para sa komportable at modernong pamumuhay</p>
                                    </div>
                                </div>

                                <p className="text-xs sm:text-sm text-[#6B7B74] leading-relaxed whitespace-pre-line mb-6">
                                    {property.description}
                                </p>

                                {/* Quick highlight pills */}
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {highlights.map((h) => (
                                        <span
                                            key={h.label}
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E4DDC9] bg-[#FAF7EF] px-3 py-2 text-xs font-bold text-[#153730] transition-transform hover:-translate-y-0.5"
                                        >
                                            <h.icon className="h-3.5 w-3.5" style={{ color: h.color }} />
                                            {h.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Reveal>

                        {/* Amenities — grouped, premium cards */}
                        <Reveal delay={80}>
                            <div className="rounded-3xl border border-[#E4DDC9] bg-[#FFFDF8] p-8 shadow-sm">
                                <h3 className="font-display text-sm font-extrabold text-[#153730] mb-5">Mga Kagamitan at Pasilidad</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {property.amenities.map((amenity, idx) => {
                                        const Icon = getAmenityIcon(amenity);
                                        const cat = AMENITY_CATEGORIES[categorizeAmenity(amenity)];
                                        return (
                                            <div
                                                key={idx}
                                                className="group relative flex items-center gap-3 rounded-2xl border border-[#E4DDC9] bg-[#FAF7EF] p-3 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_24px_-8px_rgba(21,55,48,0.25)] hover:border-[#153730]/30"
                                            >
                                                {/* Subtle gradient glow on hover */}
                                                <div
                                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                    style={{
                                                        background: `radial-gradient(120px circle at 20% 20%, ${cat.color}14, transparent)`,
                                                    }}
                                                />
                                                <div
                                                    className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FFFDF8] border border-[#E4DDC9] transition-transform duration-300 group-hover:scale-110"
                                                >
                                                    <Icon className="h-4 w-4" style={{ color: cat.color }} />
                                                </div>
                                                <span className="relative text-xs font-bold text-[#153730] line-clamp-1">{amenity}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Reveal>

                        {/* Nearby Places — intentionally removed. Your Property/UnitDetail
                            models don't carry landmark/distance data, so a "Nearby Places"
                            section here would just be invented content. Add this back once
                            you have a real source (e.g. a `nearbyLandmarks` relation in
                            Prisma, or a Google Places lookup keyed off `property.location`/
                            `property.city`) — happy to wire it in at that point. */}

                        {/* Available Units */}
                        <Reveal delay={160}>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <div>
                                        <h3 className="font-display text-lg font-extrabold text-[#153730]">Mga Bakanteng Unit at Bedspace</h3>
                                        <p className="text-xs text-[#6B7B74]">Pumili ng buong unit o partikular na kama (bed space) na nais mong i-book</p>
                                    </div>
                                </div>

                                <AvailableUnitsList units={vacantUnits} onSelectUnitToBook={handleSelectBookingTarget} />
                            </div>
                        </Reveal>

                        {/* Trust Section */}
                        <Reveal delay={200}>
                            <div className="rounded-3xl border border-[#E4DDC9] bg-[#153730] p-8 text-white">
                                <h3 className="font-display text-lg font-extrabold mb-1">Bakit Ka Dapat Magtiwala</h3>
                                <p className="text-xs text-white/60 mb-6">Sinusuri namin ang bawat listahan bago ito i-publish</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Dynamic — reflects this specific listing's real verifiedLandlord flag */}
                                    <div className="flex items-start gap-3">
                                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${property.verifiedLandlord ? "bg-white/10 text-[#F0A93A]" : "bg-white/5 text-white/40"}`}>
                                            <FileCheck2 className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">
                                                {property.verifiedLandlord ? "Beripikadong May-ari" : "Hindi pa Beripikado"}
                                            </p>
                                            <p className="text-[11px] text-white/60">
                                                {property.verifiedLandlord
                                                    ? "Kinumpirma na ang pagkakakilanlan ng may-ari"
                                                    : "Kasalukuyang sinusuri pa ang may-ari"}
                                            </p>
                                        </div>
                                    </div>
                                    {TRUST_ITEMS.map((item) => (
                                        <div key={item.label} className="flex items-start gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#F0A93A]">
                                                <item.icon className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{item.label}</p>
                                                <p className="text-[11px] text-white/60">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    {/* ══════════════════════ RIGHT COLUMN — STICKY BOOKING WIDGET ══════════════════════ */}
                    <div className="lg:col-span-4">
                        <div className="rounded-3xl border-2 border-[#E4DDC9] bg-[#FFFDF8] p-6 sm:p-8 shadow-xl sticky top-6 space-y-5">

                            {/* Price + verified */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-[11px] font-bold tracking-wider uppercase text-[#6B7B74]">Buwanang Renta</span>
                                    <div className="font-display text-2xl font-black text-[#153730]">
                                        {typeof property.price === "number" ? `₱${property.price.toLocaleString()}` : property.price}
                                    </div>
                                    <span className="text-[11px] text-[#6B7B74]">
                                        Estimadong move-in: ₱{typeof property.price === "number" ? (property.price * 2).toLocaleString() : "—"}
                                    </span>
                                </div>
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold shrink-0 ${
                                    vacantUnits.length > 0 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-[#8A5A0E]"
                                }`}>
                                    <CheckCircle2 className="h-3 w-3" />
                                    {vacantUnits.length > 0 ? "Available Ngayon" : property.status}
                                </span>
                            </div>

                            <div className="h-px w-full bg-[#E4DDC9]/60" />

                            {/* Verified + no hidden fees */}
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-2 text-[11px] text-[#6B7B74]">
                                    <ShieldCheck className="h-4 w-4 text-[#1F4B3F] shrink-0" />
                                    <span>100% Beripikadong Listahan at May-ari</span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-[#6B7B74]">
                                    <Lock className="h-4 w-4 text-[#1F4B3F] shrink-0" />
                                    <span>Walang nakatagong bayarin sa pag-book</span>
                                </div>
                            </div>

                            <p className="text-[11px] text-[#6B7B74] leading-relaxed">
                                Pumili muna ng <strong className="text-[#153730]">Unit</strong> o <strong className="text-[#153730]">Bed</strong> sa listahan sa kaliwa, o direktang i-book ang unang bakanteng slot sa ibaba.
                            </p>

                            {/* Primary CTA — gradient, hover glow, loading state */}
                            <button
                                onClick={handlePrimaryBook}
                                disabled={ctaLoading}
                                className="group relative w-full overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#153730,#1F4B3F)] py-4 text-sm font-bold text-white shadow-[0_8px_24px_-6px_rgba(21,55,48,0.5)] transition-all hover:shadow-[0_10px_30px_-4px_rgba(217,143,30,0.45)] active:scale-[0.98] disabled:opacity-80"
                            >
                                <span
                                    className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(240,169,58,0.35),transparent)] bg-[length:200%_100%] opacity-0 group-hover:opacity-100 animate-[hero-sheen_1.6s_linear_infinite]"
                                />
                                <span className="relative flex items-center justify-center gap-2">
                                    {ctaLoading ? (
                                        <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                    ) : (
                                        <CalendarCheck className="h-4 w-4 transition-transform group-hover:scale-110" />
                                    )}
                                    {ctaLoading ? "Naglo-load..." : "Mag-book ng Viewing"}
                                </span>
                            </button>

                            <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E4DDC9] py-3 text-xs font-bold text-[#153730] hover:bg-[#FAF7EF] transition-colors">
                                <MessageCircle className="h-3.5 w-3.5" />
                                Message sa May-ari
                            </button>

                            <button
                                onClick={() => setIsLiked(!isLiked)}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E4DDC9] py-3 text-xs font-bold text-[#153730] hover:bg-[#FAF7EF] transition-colors"
                            >
                                <Heart className={`h-3.5 w-3.5 transition-colors ${isLiked ? "fill-[#D98F1E] text-[#D98F1E]" : ""}`} />
                                {isLiked ? "Na-save na" : "I-save para Mamaya"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal para sa Booking */}
            {isBookingOpen && (
                <BookViewingModal
                    propertyName={property.title}
                    selectedUnit={selectedBookingTarget ? { unitNumber: selectedBookingTarget.title, price: selectedBookingTarget.price } : null}
                    onClose={() => setIsBookingOpen(false)}
                />
            )}
        </main>
    );
}