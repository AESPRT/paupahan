"use client";

import { useState } from "react";
import { Bell, CheckCircle2, Home, Sparkles } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function FooterCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section
      className="relative overflow-hidden py-24 lg:py-32"
      style={{ backgroundColor: "var(--forest-deep)" }}
    >
      {/* ── Ambient background glows ── */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[var(--marigold)]/8 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full bg-[var(--forest)]/60 blur-[100px] pointer-events-none" />

      {/* ── Subtle dot grid texture ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #FAF7EF 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
        {/* ── Eyebrow badge ── */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--marigold)]/30 bg-[var(--marigold)]/10 mb-6">
          <Sparkles className="h-3.5 w-3.5 text-[var(--marigold)]" />
          <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--marigold)]">
            Alerto sa Bagong Listahan
          </span>
        </div>

        {/* ── Headline ── */}
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--paper)] mb-4 leading-tight">
          Hindi mo pa makita{" "}
          <span className="relative inline-block text-[var(--marigold)]">
            ang para sa iyo?
            <svg
              aria-hidden="true"
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 260 8"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M0 6 Q32 1 65 5 Q98 9 130 4 Q162 -1 195 5 Q228 9 260 4"
                stroke="var(--marigold)"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.6"
              />
            </svg>
          </span>
        </h2>

        <p className="font-body text-base sm:text-lg text-[var(--paper)]/60 mb-10 max-w-lg mx-auto leading-relaxed">
          I-alerto ka namin agad kapag may bagong bakanteng unit sa lugar mo —
          bago pa maabot ng iba.
        </p>

        {/* ── Form / Success state ── */}
        {submitted ? (
          <div className="mx-auto max-w-sm rounded-2xl border border-[var(--marigold)]/20 bg-[var(--marigold)]/8 p-8">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--marigold)]/15 border border-[var(--marigold)]/30">
                <CheckCircle2 className="h-7 w-7 text-[var(--marigold)]" />
              </div>
            </div>
            <h3 className="font-display text-xl font-black text-[var(--paper)] mb-2">
              Salamat! 🎉
            </h3>
            <p className="font-body text-sm text-[var(--paper)]/60 leading-relaxed">
              Ise-send namin ang mga pinakabagong listahan sa iyong email.
              Abangan mo!
            </p>
          </div>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              className="mx-auto max-w-md flex flex-col sm:flex-row gap-2.5"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address mo"
                className={cn(
                  "flex-1 rounded-xl border border-[var(--paper)]/15 bg-[var(--paper)]/6",
                  "px-4 py-3.5 text-sm text-[var(--paper)]",
                  "placeholder:text-[var(--paper)]/35",
                  "outline-none focus:border-[var(--marigold)]/60 focus:bg-[var(--paper)]/10",
                  "transition-all duration-300",
                )}
              />
              <button
                type="submit"
                className={cn(
                  "flex items-center justify-center gap-2",
                  "rounded-xl bg-[var(--marigold)] px-6 py-3.5",
                  "text-sm font-extrabold text-[var(--forest-deep)]",
                  "hover:bg-[var(--accent-gold)] active:scale-95",
                  "shadow-lg shadow-[var(--marigold)]/25",
                  "transition-all duration-300 whitespace-nowrap",
                )}
              >
                <Bell className="h-4 w-4" />
                I-notify Ako
              </button>
            </form>

            {/* Trust nudge */}
            <p className="mt-4 text-xs text-[var(--paper)]/35 font-body">
              Libre. Walang spam. I-unsubscribe anytime.
            </p>
          </>
        )}

        {/* ── Bottom decorative stat strip ── */}
        <div className="mt-16 flex items-center justify-center gap-8 sm:gap-12">
          {[
            { value: "500+", label: "Aktibong Paupahan" },
            { value: "100%", label: "Libreng Gamitin" },
            { value: "24h", label: "Bagong Listahan" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="font-display text-2xl sm:text-3xl font-black text-[var(--marigold)]">
                {value}
              </div>
              <div className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--paper)]/40">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Thin divider between stats */}
        <div className="mt-10 flex items-center gap-4">
          <div className="h-px flex-1 bg-[var(--paper)]/8" />
          <Home className="h-4 w-4 text-[var(--paper)]/20" />
          <div className="h-px flex-1 bg-[var(--paper)]/8" />
        </div>
      </div>
    </section>
  );
}
