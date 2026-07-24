import Link from "next/link";
import { Suspense } from "react";
import { AdminRegisterForm } from "./AdminRegisterForm";

export function AdminRegisterCard() {
  return (
    <div className="mx-auto w-full max-w-[540px] rounded-2xl border border-line bg-paper-card p-6 shadow-[0_12px_32px_rgba(27,58,52,0.08)] sm:p-8">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-marigold-deep/25 bg-marigold/[0.15] px-3 py-1 font-mono-brand text-[11.5px] font-semibold uppercase tracking-[0.08em] text-forest-deep">
          Lifetime Free Trial but limited features. Upgrade to unlock all features.
        </span>
        <h1 className="mt-3 font-display text-2xl font-bold text-forest-deep sm:text-3xl">
          Simulan ang Paupahan
        </h1>
        <p className="mt-2 text-sm text-muted">
          Gumawa ng account para ma-manage ang iyong mga bahay-paupahan, resibo, at tenant.
        </p>
      </div>

      <Suspense fallback={<div className="text-center py-6 text-sm text-muted">Naglo-load...</div>}>
        <AdminRegisterForm />
      </Suspense>

      <p className="mt-6 text-center text-xs text-muted">
        May account ka na?{" "}
        <Link href="/admin/login" className="font-bold text-forest-deep underline hover:text-forest">
          Mag-login Dito
        </Link>
      </p>
    </div>
  );
}