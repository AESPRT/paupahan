"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TenantLoginForm } from "@/src/components/tenant/auth/TenantLoginForm";
import { LoginHelpModal } from "@/src/components/tenant/auth/LoginHelpModal";
import { PaupahanLogo } from "@/src/components/ui/PaupahanLogo";
import { Footer } from "@/src/components/landing/Footer";
import { loginTenantAction } from "@/src/actions/tenant/tenant-auth-actions";

export default function TenantLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeParam = searchParams.get("code");

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [qrError, setQrError] = useState("");
  const [isAutoLoggingIn, startAutoLoginTransition] = useTransition();

  // 1. Ideklara muna ang handleQrLogin gamit ang useCallback bago ang useEffect
  const handleQrLogin = useCallback((code: string) => {
    startAutoLoginTransition(async () => {
      setQrError("");
      const result = await loginTenantAction(code);

      if (result.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem("tenant_code", code);
        }
        router.push("/tenant/dashboard/home");
        router.refresh();
      } else {
        setQrError(result.error || "Mali o expired ang QR Code na iyong ginamit.");
      }
    });
  }, [router]);

  // 2. Gamitin na ito sa useEffect ngayon na deklarado na sa itaas
  useEffect(() => {
    if (codeParam) {
      handleQrLogin(codeParam);
    }
  }, [codeParam, handleQrLogin]);

  const handleSuccessfulLogin = (loginCode: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tenant_code", loginCode);
    }
    router.push("/tenant/dashboard/home");
    router.refresh();
  };

  if (codeParam && isAutoLoggingIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper p-4">
        <div className="w-full max-w-md rounded-3xl border border-line bg-paper-card p-8 shadow-md text-center space-y-4">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-forest border-r-transparent"></div>
          <h2 className="font-display text-lg font-bold text-forest-deep">
            Binabasa ang QR Code...
          </h2>
          <p className="text-xs text-muted font-mono-brand">
            Sandali lamang habang inilalagay ka sa iyong dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-forest/10 text-3xl shadow-sm">
            <PaupahanLogo size={38} />
          </div>
          <h1 className="font-display text-2xl font-black text-forest-deep sm:text-3xl">
            Paupahan Tenant Portal
          </h1>
          <p className="text-xs text-muted">
            Ipasok ang iyong natatanging Tenant Code para suriin ang billing, resibo, at mag-report ng sira sa kwarto.
          </p>
        </div>

        {qrError && (
          <div className="rounded-2xl bg-coral/10 border border-coral/30 p-4 text-xs text-coral-deep text-center font-bold">
            {qrError}
          </div>
        )}

        <div className="rounded-3xl border border-line bg-paper-card p-6 sm:p-8 shadow-md">
          <TenantLoginForm onSuccessLogin={handleSuccessfulLogin} />

          <div className="mt-6 text-center border-t border-line/60 pt-4">
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="text-xs font-bold text-forest hover:underline focus:outline-none"
            >
              Wala ka pang Login Code? I-click ito ❓
            </button>
          </div>
        </div>

        <Footer showNavLinks={false} />
      </div>

      <LoginHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}