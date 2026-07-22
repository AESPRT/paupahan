import Link from "next/link";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export function ForgotPasswordCard() {
  return (
    <div className="mx-auto w-full max-w-[420px] rounded-2xl border border-line bg-paper-card p-6 shadow-[0_12px_32px_rgba(27,58,52,0.08)] sm:p-8">
      <div className="text-center">
        {/* Playful Key Badge Icon */}
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-coral-deep/20 bg-coral-deep/[0.08] text-coral-deep">
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        </div>

        <h1 className="font-display text-2xl font-bold text-forest-deep sm:text-3xl">
          Nakalimutan ang Password?
        </h1>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Huwag mag-alala! Ipasok ang iyong email address para mapadalhan ka namin ng instructions para ma-reset ang password.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="mt-6 text-center text-xs text-muted">
        Naalala mo na ang iyong password?{" "}
        <Link href="/admin/login" className="font-bold text-forest-deep underline hover:text-forest">
          Mag-login Dito
        </Link>
      </p>
    </div>
  );
}