"use client";

import { useState, useTransition } from "react";
import { loginTenantAction } from "@/src/actions/tenant/tenant-auth-actions"; // I-adjust ang path kung kinakailangan

interface TenantLoginFormProps {
  onSuccessLogin: (loginCode: string) => void;
}

export function TenantLoginForm({ onSuccessLogin }: TenantLoginFormProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");

    const cleanCode = code.trim();

    if (!cleanCode) {
      setError("Paki-type ang iyong Tenant Login Code.");
      return;
    }

    startTransition(async () => {
      const result = await loginTenantAction(cleanCode);

      if (result.success) {
        onSuccessLogin(cleanCode);
      } else {
        setError(result.error || "Hindi mahanap ang Tenant Code na ito. Mangyaring sumangguni sa iyong Landlord.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div className="rounded-2xl border border-coral/30 bg-coral/10 p-3 text-center text-xs font-semibold text-coral-deep animate-in fade-in zoom-in-95 duration-200">
          ⚠️ {error}
        </div>
      )}

      {/* Input Code Field */}
      <div>
        <label className="block text-xs font-bold text-forest-deep mb-1.5">
          Tenant Login Code
        </label>
        <div className="relative">
          <input
            type="text"
            maxLength={20}
            placeholder="e.g. TNT-8K2P9X"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-2xl border border-line bg-paper px-4 py-3.5 font-mono-brand text-center text-base font-bold tracking-widest text-forest-deep outline-none transition-all placeholder:font-sans placeholder:text-xs placeholder:font-normal placeholder:tracking-normal placeholder:text-muted focus:border-forest focus:ring-2 focus:ring-forest/10 uppercase"
            required
            disabled={isPending}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-muted text-center">
          Makikita ang code na ito sa ibinigay na resibo o mensahe mula sa Landlord.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-forest py-3.5 font-mono-brand text-xs font-bold text-white shadow-md transition-all hover:bg-forest-deep active:scale-95 disabled:opacity-50"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Biniberipika...
          </span>
        ) : (
          "I-enter at Mag-login ➔"
        )}
      </button>
    </form>
  );
}