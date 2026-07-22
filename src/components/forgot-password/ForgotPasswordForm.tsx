"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Input } from "@/src/components/ui/Input";

const DEMO_EMAIL = "admin@paupahan.ph";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    startTransition(async () => {
      try {
        // 1. Konek sa backend API (kung mayroon)
        if (process.env.NEXT_PUBLIC_API_URL) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            }
          );

          if (!response.ok) {
            const data = await response.json();
            setErrorMessage(data.message || "May nangyaring mali. Pakisubukan ulit.");
            return;
          }
        } else {
          // Mock delay kung wala pang running backend
          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        setIsSuccess(true);
      } catch (err) {
        console.error("Forgot password request failed:", err);
        setErrorMessage("Hindi makakonekta sa server. Pakisuri ang iyong internet.");
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="mt-6 space-y-4 text-center">
        <div className="rounded-2xl border border-forest/20 bg-forest/[0.06] p-4 text-sm text-forest-deep">
          <p className="font-bold">Nai-send na ang Reset Link! ✉️</p>
          <p className="mt-1 text-xs text-muted">
            Ipinadala namin ang instructions sa <span className="font-semibold text-forest-deep">{email}</span>. Pakisuri ang iyong inbox o Spam folder.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsSuccess(false);
            setEmail("");
          }}
          className="text-xs font-semibold text-coral-deep hover:underline"
        >
          Magpadala ng panibagong link
        </button>

        <div className="pt-2">
          <Link
            href="/admin-login"
            className="inline-flex items-center justify-center rounded-full border border-line bg-paper px-6 py-2.5 text-xs font-bold text-forest-deep transition-all hover:-translate-y-0.5 hover:bg-paper-card"
          >
            Bumalik sa Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {errorMessage && (
        <div className="rounded-xl border border-coral/30 bg-coral/10 p-3 text-xs font-semibold text-coral-deep">
          {errorMessage}
        </div>
      )}

      {/* Demo Email Quick Fill Button */}
      <div className="flex items-center justify-between rounded-xl border border-forest/15 bg-forest/[0.03] p-2.5 text-xs text-muted">
        <span>Gusto mong i-test?</span>
        <button
          type="button"
          onClick={() => setEmail(DEMO_EMAIL)}
          className="rounded-lg bg-forest/10 px-2 py-1 text-[11px] font-bold text-forest hover:bg-forest/20"
        >
          Gamitin ang Demo Email
        </button>
      </div>

      <Input
        id="email"
        type="email"
        label="Email Address"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="juan@example.com"
        autoComplete="email"
      />

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 flex w-full items-center justify-center rounded-full bg-coral px-6 py-3.5 font-bold text-white shadow-[0_8px_20px_rgba(225,91,78,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(225,91,78,0.42)] active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {isPending ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Ipinapadala...
          </span>
        ) : (
          "Ipadala ang Reset Link"
        )}
      </button>
    </form>
  );
}