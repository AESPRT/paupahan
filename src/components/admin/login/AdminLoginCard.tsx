import Link from "next/link";
import { AdminLoginForm } from "./AdminLoginForm";

export function AdminLoginCard() {
  return (
    <div className="mx-auto w-full max-w-[420px] rounded-2xl border border-line bg-paper-card p-6 shadow-[0_12px_32px_rgba(27,58,52,0.08)] sm:p-8">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-coral-deep/25 bg-coral-deep/[0.09] px-3 py-1 font-mono-brand text-[11.5px] font-semibold uppercase tracking-[0.08em] text-coral-deep">
          Admin Portal
        </span>
        <h1 className="mt-3 font-display text-2xl font-bold text-forest-deep sm:text-3xl">
          Mag-login sa Account
        </h1>
        <p className="mt-2 text-sm text-muted">
          Ipasok ang iyong email at password para ma-access ang paupahan dashboard.
        </p>
      </div>

      <AdminLoginForm />

      <p className="mt-6 text-center text-xs text-muted">
        Wala ka pang account?{" "}
        <Link href="/admin/register" className="font-bold text-forest-deep underline hover:text-forest">
          Simulan Ngayon
        </Link>
      </p>
    </div>
  );
}
