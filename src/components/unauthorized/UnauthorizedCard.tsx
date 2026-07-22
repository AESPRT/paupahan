import Link from "next/link";

export function UnauthorizedCard() {
  return (
    <div className="mx-auto w-full max-w-[480px] rounded-2xl border border-line bg-paper-card p-6 text-center shadow-[0_12px_32px_rgba(27,58,52,0.08)] sm:p-10">
      {/* Playful Bouncing Lock Icon */}
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-coral-deep/20 bg-coral-deep/[0.08] text-coral-deep">
        <svg
          className="h-10 w-10 animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 002-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>

      {/* Status Badge */}
      <span className="inline-flex items-center gap-2 rounded-full border border-coral-deep/25 bg-coral-deep/[0.09] px-3.5 py-1 font-mono-brand text-[11.5px] font-semibold uppercase tracking-[0.08em] text-coral-deep">
        401 — Access Denied
      </span>

      {/* Heading & Playful Message */}
      <h1 className="mt-4 font-display text-2xl font-bold text-forest-deep sm:text-3xl">
        Ayy! Bawal pumasok dito! 🛑
      </h1>

      <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
        Mukhang sinusubukan mong buksan ang pintuan ng kwarto na wala kang susi. Ang area na ito ay para lamang sa mga otorisadong user o admin.
      </p>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/admin-login"
          className="flex items-center justify-center rounded-full bg-coral px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(225,91,78,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(225,91,78,0.42)] active:translate-y-0"
        >
          Mag-login bilang Admin
        </Link>

        <Link
          href="/"
          className="flex items-center justify-center rounded-full border border-line bg-paper px-6 py-3.5 text-sm font-bold text-forest-deep transition-all hover:-translate-y-0.5 hover:bg-paper-card active:translate-y-0"
        >
          Umuwi na Muna
        </Link>
      </div>

      {/* Footer link inside card */}
      <p className="mt-6 text-xs text-muted">
        Maling account ba ang gamit mo?{" "}
        <Link href="/login" className="font-bold text-forest-deep underline hover:text-forest">
          Lumipat ng Account
        </Link>
      </p>
    </div>
  );
}