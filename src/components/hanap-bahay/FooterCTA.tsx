"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

export function FooterCTA() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) setSubmitted(true);
    };

    return (
        <section className="py-20 bg-[#153730] text-white">
            <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
                    Hindi mo pa rin makita ang hinahanap mo?
                </h2>
                <p className="text-[#FAF7EF]/70 mb-8">
                    I-alerto ka namin kapag may bagong bakanteng unit sa lugar mo.
                </p>

                {submitted ? (
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 max-w-md mx-auto">
                        <h3 className="font-display text-lg font-bold text-[#F0A93A] mb-1">Salamat! 🎉</h3>
                        <p className="text-sm text-[#FAF7EF]/70">
                            Ise-send namin ang mga bagong listahan sa email mo.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="mx-auto max-w-md flex flex-col sm:flex-row gap-2">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address mo"
                            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#F0A93A] focus:bg-white/10 transition-colors"
                        />
                        <button
                            type="submit"
                            className="flex items-center justify-center gap-2 rounded-xl bg-[#F0A93A] px-5 py-3 text-sm font-bold text-[#153730] hover:bg-[#FADA7A] transition-colors"
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