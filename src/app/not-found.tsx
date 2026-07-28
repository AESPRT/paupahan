"use client";

import Link from "next/link";
import { PaupahanLogo } from "@/src/components/ui/PaupahanLogo";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-paper px-6 py-12 text-center overflow-hidden">
      
      {/* Decorative Playful Background Blobs */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-marigold/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-coral/15 blur-3xl" />

      <div className="relative z-10 w-full max-w-md space-y-8 rounded-3xl border border-forest/15 bg-paper-card p-8 shadow-[0_12px_36px_rgba(27,58,52,0.08)] sm:p-10 backdrop-blur-md">
        
        {/* Logo at Playful Badge */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-forest/10 border border-forest/20 shadow-inner">
            <PaupahanLogo size={48} />
          </div>
          <span className="font-display text-xs font-bold tracking-widest text-forest uppercase bg-forest/10 px-3 py-1 rounded-full">
            Paupahan System
          </span>
        </div>

        {/* 404 Playful Heading */}
        <div className="space-y-3">
          <h1 className="font-mono-brand text-7xl font-black tracking-wider text-coral drop-shadow-sm">
            404
          </h1>
          <h2 className="font-display text-2xl font-bold text-forest-deep">
            Nawawala ang Landas Mo! 🧭
          </h2>
          <p className="text-xs sm:text-sm text-muted leading-relaxed font-medium">
            Mukhang napadpad ka sa isang silid na wala pa o inilipat na. Huwag mag-alala, pwede kang bumalik sa ligtas na tahanan.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center">
          <Link
            href="/admin/dashboard/home"
            className="inline-flex items-center justify-center rounded-xl bg-forest-deep px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:bg-forest hover:shadow-lg active:scale-95"
          >
            Bumalik sa Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center rounded-xl border border-line bg-paper px-5 py-3 text-xs sm:text-sm font-bold text-forest-deep transition-all hover:bg-forest/5 active:scale-95"
          >
            I-back ang Pahina
          </button>
        </div>

      </div>

      {/* Footer text */}
      <footer className="mt-8 text-xs font-mono-brand text-muted">
        &copy; {new Date().getFullYear()} Paupahan Property Management. Lahat ng karapatan ay nakalaan.
      </footer>
    </main>
  );
}