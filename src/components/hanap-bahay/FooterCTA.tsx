"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Home, Sparkles, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function FooterCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };
  
  return (
    <footer
      className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden m-0 p-0 shadow-sm"
      style={{ backgroundColor: "var(--forest-deep)" }}
    >
      {/* ── Ambient background glows ── */}
      <div className="absolute top-1/4 -left-32 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-[var(--marigold)]/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-24 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] rounded-full bg-[var(--forest)]/60 blur-[100px] pointer-events-none" />

      {/* ── Subtle dot grid texture ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #FAF7EF 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Top spacer para sa balanse */}
      <div className="w-full h-10 shrink-0" />

      {/* Main Center Content */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center my-auto w-full flex flex-col items-center justify-center py-6">
        {/* ── Eyebrow badge ── */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--marigold)]/30 bg-[var(--marigold)]/10 mb-4 sm:mb-5">
          <Sparkles className="h-3.5 w-3.5 text-[var(--marigold)] shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--marigold)]">
            Alerto sa Bagong Listahan
          </span>
        </div>

        {/* ── Headline ── */}
        <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--paper)] mb-3 sm:mb-4 leading-[1.15]">
          Hindi mo pa makita{" "}
          <span className="relative inline-block text-[var(--marigold)]">
            ang para sa iyo?
            <svg
              aria-hidden="true"
              className="absolute -bottom-1.5 sm:-bottom-2 left-0 w-full"
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

        <p className="font-body text-xs sm:text-base lg:text-lg text-[var(--paper)]/60 mb-6 sm:mb-8 max-w-md sm:max-w-lg mx-auto leading-relaxed">
          I-alerto ka namin agad kapag may bagong bakanteng unit sa lugar mo —
          bago pa maabot ng iba.
        </p>

        {/* ── Form / Success state ── */}
        {submitted ? (
          <div className="mx-auto max-w-sm rounded-2xl border border-[var(--marigold)]/20 bg-[var(--marigold)]/8 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300 w-full">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[var(--marigold)]/15 border border-[var(--marigold)]/30">
                <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-[var(--marigold)]" />
              </div>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-black text-[var(--paper)] mb-1.5">
              Salamat! 🎉
            </h3>
            <p className="font-body text-xs sm:text-sm text-[var(--paper)]/60 leading-relaxed">
              Ise-send namin ang mga pinakabagong listahan sa iyong email.
              Abangan mo!
            </p>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address mo"
                className={cn(
                  "flex-1 rounded-xl border border-[var(--paper)]/15 bg-[var(--paper)]/6",
                  "px-4 py-3 text-xs sm:text-sm text-[var(--paper)]",
                  "placeholder:text-[var(--paper)]/35",
                  "outline-none focus:border-[var(--marigold)]/60 focus:bg-[var(--paper)]/10",
                  "transition-all duration-300",
                )}
              />
              <button
                type="submit"
                className={cn(
                  "flex items-center justify-center gap-2",
                  "rounded-xl bg-[var(--marigold)] px-6 py-3",
                  "text-xs sm:text-sm font-extrabold text-[var(--forest-deep)]",
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
            <p className="mt-3 text-[11px] sm:text-xs text-[var(--paper)]/35 font-body">
              Libre. Walang spam. I-unsubscribe anytime.
            </p>
          </div>
        )}
      </div>

      {/* Extended Footer Links & Details Section */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full py-8 sm:py-12 border-t border-[var(--paper)]/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About / Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-[var(--marigold)]" />
              <span className="font-display font-black text-lg text-[var(--paper)]">HanapBahay PH</span>
            </div>
            <p className="text-xs text-[var(--paper)]/60 leading-relaxed">
              Ang iyong pinagkakatiwalaang direktang plataporma para sa mga paupahan, apartment, at condo sa buong Pilipinas. Walang middleman, walang hidden fees.
            </p>
            <div className="pt-1">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--marigold)] hover:underline"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Admin Portal & Management</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-[var(--paper)] uppercase tracking-wider">Mga Pahina</h4>
            <ul className="space-y-2 text-xs text-[var(--paper)]/70">
              <li><Link href="/hanap-bahay" className="hover:text-[var(--marigold)] transition-colors">Tampok na Paupahan</Link></li>
              <li><Link href="/hanap-bahay/search" className="hover:text-[var(--marigold)] transition-colors">Mag-browse ng Lahat</Link></li>
              <li><Link href="/list-property" className="hover:text-[var(--marigold)] transition-colors">Mag-post ng Ari-arian</Link></li>
              <li><Link href="/about" className="hover:text-[var(--marigold)] transition-colors">Tungkol sa Amin</Link></li>
            </ul>
          </div>

          {/* Social Media & Community */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-[var(--paper)] uppercase tracking-wider">Social Media</h4>
            <ul className="space-y-2 text-xs text-[var(--paper)]/70">
              <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--marigold)] transition-colors">Facebook Page</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--marigold)] transition-colors">Instagram Updates</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--marigold)] transition-colors">Twitter / X Community</a></li>
              <li><a href="https://facebook.com/groups" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--marigold)] transition-colors">Pilipinas Landlord Group</a></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-[var(--paper)] uppercase tracking-wider">Suporta</h4>
            <ul className="space-y-2 text-xs text-[var(--paper)]/70">
              <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-[var(--marigold)]" /> support@hanapbahay.ph</li>
              <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-[var(--marigold)]" /> +63 (2) 8123-4567</li>
              <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-[var(--marigold)]" /> Metro Manila, Pilipinas</li>
            </ul>
          </div>
        </div>

        {/* Bottom Stats & Copyright Strip */}
        <div className="pt-6 border-t border-[var(--paper)]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center justify-center gap-6 text-xs text-[var(--paper)]/50">
            <span>© {new Date().getFullYear()} HanapBahay PH. All rights reserved.</span>
            <Link href="/privacy" className="hover:text-[var(--paper)]">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[var(--paper)]">Terms of Service</Link>
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--marigold)] font-semibold">
            <span>500+ Aktibong Paupahan</span>
            <span>•</span>
            <span>100% Libre</span>
          </div>
        </div>
      </div>
    </footer>
  );
}