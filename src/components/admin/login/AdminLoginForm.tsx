"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/src/components/ui/Input";
import { loginUser } from "@/src/actions/auth-actions";

export function AdminLoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const result = await loginUser(formData);

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      // Redirect sa admin dashboard
      router.refresh();
      router.push("/admin/dashboard/home");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {errorMessage && (
        <div className="rounded-xl border border-coral/30 bg-coral/10 p-3 text-xs font-semibold text-coral-deep">
          {errorMessage}
        </div>
      )}

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

      <Input
        id="password"
        type="password"
        label="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        autoComplete="current-password"
        rightElement={
          <Link href="/admin/forgot-password" className="text-xs font-semibold text-coral-deep hover:underline">
            Nakalimutan ang password?
          </Link>
        }
      />

      <div className="flex items-center justify-between pt-1">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-line text-forest focus:ring-forest cursor-pointer"
          />
          <span className="text-xs font-semibold text-muted">Tandaan ako sa device na ito</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 flex w-full items-center justify-center rounded-full bg-coral px-6 py-3.5 font-bold text-white shadow-[0_8px_20px_rgba(225,91,78,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(225,91,78,0.42)] active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer"
      >
        {isPending ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Pumapasok...
          </span>
        ) : (
          "Mag-login"
        )}
      </button>
    </form>
  );
}