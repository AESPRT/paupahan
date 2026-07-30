// ==========================================
// 10. FOOTER CTA COMPONENT (components/hanap-bahay/FooterCTA.tsx)
// ==========================================
"use client";

import { useState } from "react";
import { Bell, Sparkles } from "lucide-react";

export function FooterCTA() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        if (email) setSubmitted(true);
    };

    return (
        <section className="py-20 bg-gradient-to-b from-[#FAF7EF] to-[#153730] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-[#F0A93A]/10 blur-3xl" />

            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F0A93A]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#F0A93A] mb-6">
                    <Sparkles className="h-4 w-4" />
                    <span>Huwag Magpahuli</span>
                </div>

                <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
                    Hindi mo pa rin makita ang hinahanap mo?
                </h2>
                <p className="mx-auto max-w-2xl text-base sm:text-lg text-[#FAF7EF]/80 mb-8">
                    Mag-subscribe sa aming notification para agad na maabisuhan kapag may bagong bakanteng unit sa iyong gustong lugar.
                </p>

                {submitted ? (
                    <div className="rounded-2xl bg-[#1F4B3F] border border-[#E4DDC9]/20 p-6 max-w-md mx-auto text-center">
                        <h3 className="font-display text-xl font-bold text-[#F0A93A] mb-1">Salamat sa Pag-subscribe! 🎉</h3>
                        <p className="text-sm text-[#FAF7EF]/80">I-se-send namin ang mga bagong listahan direkta sa iyong email.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="mx-auto max-w-md flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Ilagay ang iyong email address"
                            className="flex-1 rounded-2xl border border-white/20 bg-white/10 px-4 py-3.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#F0A93A]"
                        />
                        <button
                            type="submit"
                            className="flex items-center justify-center gap-2 rounded-2xl bg-[#F0A93A] px-6 py-3.5 font-display font-bold text-[#153730] hover:bg-[#D98F1E] transition-all shadow-lg"
                        >
                            <Bell className="h-4 w-4" />
                            <span>Notify Me</span>
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}