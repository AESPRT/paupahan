import { Building2, ShieldCheck, TrendingUp } from "lucide-react";

export const STATS = [
    { label: "Verified Listings", value: "350+", icon: Building2 },
    { label: "New This Week", value: "120+", icon: TrendingUp },
    { label: "Trusted Landlords", value: "50+", icon: ShieldCheck },
];

export const POPULAR_CITIES = [
    { name: "Quezon City", icon: "🏙️" },
    { name: "Manila", icon: "🏛️" },
    { name: "Cebu City", icon: "🏖️" },
    { name: "Davao City", icon: "⛰️" },
];

export const BUDGET_OPTIONS = [
    { value: "", label: "Any budget" },
    { value: "0-5000", label: "₱5,000 & below" },
    { value: "5000-10000", label: "₱5,000 - ₱10,000" },
    { value: "10000-20000", label: "₱10,000 - ₱20,000" },
    { value: "20000+", label: "₱20,000+" },
];

export const TYPE_OPTIONS = [
    { value: "", label: "All Properties" },
    { value: "apartment", label: "Apartment" },
    { value: "condo", label: "Condo Unit" },
    { value: "house", label: "House" },
    { value: "room", label: "Room / Bedspace" },
];

/** Illustration Component loading from /public/svg/best_place.svg */
export function FullHouseIllustration() {
    return (
        <img
            src="/svg/best_place.svg"
            alt="Modern Home Search Illustration"
            className="w-full h-auto max-h-[150px] object-contain"
        />
    );
}