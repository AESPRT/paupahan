"use client";

import { useState } from "react";
import {
    Calendar,
    Clock,
    X,
    CheckCircle2,
    User,
    Phone,
    Home,
    ShieldCheck,
    Sparkles,
    ArrowRight,
} from "lucide-react";

interface BookViewingModalProps {
    propertyName: string;
    selectedUnit?: { unitNumber: string; price: number } | null;
    onClose: () => void;
}

export function BookViewingModal({ propertyName, selectedUnit, onClose }: BookViewingModalProps) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate minor smooth transition/network request for production feel
        window.setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-3xl border border-[#E4DDC9] bg-[#FFFDF8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 fade-in duration-300">

                {/* Modal Header Banner */}
                <div className="relative bg-[#153730] px-6 py-5 text-white flex items-center justify-between">
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-0.5 font-mono-brand text-[10px] font-bold text-[#FAF7EF] mb-1.5">
                            <Sparkles className="h-3 w-3 text-[#D98F1E]" />
                            Libreng Pag-iiskedyul
                        </div>
                        <h2 className="font-display text-lg font-black tracking-wide text-white truncate max-w-[360px]">
                            {propertyName}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition-all cursor-pointer hover:rotate-90 duration-200"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Modal Body (Scrollable) */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    {submitted ? (
                        /* Premium Success State — one-time entrance, no idle looping animation */
                        <div className="text-center py-6 space-y-4">
                            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1F4B3F]/10 text-[#1F4B3F] animate-in zoom-in-50 fade-in duration-500">
                                <CheckCircle2 className="h-9 w-9 text-[#153730]" />
                                <span className="absolute inset-0 rounded-2xl border-2 border-[#153730]/20 animate-in zoom-in-125 fade-out duration-700" />
                            </div>
                            <div className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                                <h3 className="font-display text-xl font-extrabold text-[#153730]">Tagumpay ang Pag-book!</h3>
                                <p className="text-xs text-[#6B7B74] max-w-sm mx-auto leading-relaxed">
                                    Naipadala na ang iyong kahilingan para sa viewing sa landlord ng <span className="font-bold text-[#153730]">{propertyName}</span> {selectedUnit ? `(Unit ${selectedUnit.unitNumber})` : ""}. Makikipag-ugnayan sila sa iyo sa lalong madaling panahon.
                                </p>
                            </div>

                            <div className="rounded-2xl bg-[#FAF7EF] border border-[#E4DDC9] p-4 text-left space-y-2 max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
                                <div className="flex items-center justify-between text-xs text-[#6B7B74]">
                                    <span>Pangalan:</span>
                                    <span className="font-bold text-[#153730]">{name}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-[#6B7B74]">
                                    <span>Telepono:</span>
                                    <span className="font-bold text-[#153730]">{phone}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-[#6B7B74]">
                                    <span>Petsa at Oras:</span>
                                    <span className="font-bold text-[#153730]">{date} @ {time}</span>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full max-w-sm rounded-2xl bg-[#153730] py-3 font-display text-xs font-bold text-white hover:bg-[#1F4B3F] transition-all shadow-md cursor-pointer active:scale-[0.98]"
                            >
                                Tapusin at Isara
                            </button>
                        </div>
                    ) : (
                        /* Booking Form */
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Property & Unit Summary Card */}
                            <div className="rounded-2xl border border-[#E4DDC9] bg-[#FAF7EF] p-4 flex items-center justify-between gap-3 shadow-2xs">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1F4B3F]/10 text-[#1F4B3F]">
                                        <Home className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-mono-brand text-[#6B7B74] tracking-wider block">Napiling Tirahan</span>
                                        <span className="text-xs font-bold text-[#153730] block">
                                            {selectedUnit ? `Unit ${selectedUnit.unitNumber}` : "Buong Property"}
                                        </span>
                                    </div>
                                </div>
                                {selectedUnit && (
                                    <div className="text-right">
                                        <span className="text-[10px] uppercase font-mono-brand text-[#6B7B74] tracking-wider block">Buwanang Renta</span>
                                        <span className="font-mono-brand text-xs font-black text-[#153730]">
                                            ₱{selectedUnit.price.toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Personal Details */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-[#153730] mb-1.5 flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5 text-[#1F4B3F]" /> Buong Pangalan
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Hal. Juan Dela Cruz"
                                        className="w-full rounded-xl border border-[#E4DDC9] bg-[#FAF7EF] px-3.5 py-2.5 text-xs font-medium text-[#153730] outline-none focus:border-[#1F4B3F] focus:bg-white transition-all shadow-2xs"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-[#153730] mb-1.5 flex items-center gap-1.5">
                                        <Phone className="h-3.5 w-3.5 text-[#1F4B3F]" /> Numero ng Telepono / Mobile Number
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Hal. 09123456789"
                                        className="w-full rounded-xl border border-[#E4DDC9] bg-[#FAF7EF] px-3.5 py-2.5 text-xs font-medium text-[#153730] outline-none focus:border-[#1F4B3F] focus:bg-white transition-all shadow-2xs"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-[#153730] mb-1.5 flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-[#1F4B3F]" /> Petsa ng Viewing
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full rounded-xl border border-[#E4DDC9] bg-[#FAF7EF] px-3.5 py-2.5 text-xs font-medium text-[#153730] outline-none focus:border-[#1F4B3F] focus:bg-white transition-all shadow-2xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#153730] mb-1.5 flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5 text-[#1F4B3F]" /> Oras
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            className="w-full rounded-xl border border-[#E4DDC9] bg-[#FAF7EF] px-3.5 py-2.5 text-xs font-medium text-[#153730] outline-none focus:border-[#1F4B3F] focus:bg-white transition-all shadow-2xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Trust Indicators Footer */}
                            <div className="rounded-2xl bg-[#E2ECE9]/50 border border-[#1F4B3F]/20 p-3 flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#1F4B3F] text-white">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                <p className="text-[11px] text-[#153730] leading-tight font-medium">
                                    Libre ang pag-iiskedyul. Walang kinakailangang online payment o paunang bayad para sa viewing.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E4DDC9]/60">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-xl border border-[#E4DDC9] bg-white px-4 py-2.5 font-display text-xs font-bold text-[#6B7B74] hover:bg-[#FAF7EF] transition-all cursor-pointer"
                                >
                                    Kanselahin
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-xl bg-[#153730] px-6 py-2.5 font-display text-xs font-bold text-white hover:bg-[#1F4B3F] shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmitting && (
                                        <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                    )}
                                    <span>{isSubmitting ? "Isinusumite..." : "Kumpirmahin ang Booking"}</span>
                                    {!isSubmitting && <ArrowRight className="h-3.5 w-3.5" />}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

            </div>
        </div>
    );
}