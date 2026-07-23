"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TenantLoginForm } from "@/src/components/tenant/auth/TenantLoginForm";
import { LoginHelpModal } from "@/src/components/tenant/auth/LoginHelpModal";
import { PaupahanLogo } from "@/src/components/ui/PaupahanLogo";
import { Footer } from "@/src/components/landing/Footer";

export default function TenantLoginPage() {
  const router = useRouter();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleSuccessfulLogin = (loginCode: string) => {
    // I-save sa LocalStorage o Cookie session ang Login Code
    if (typeof window !== "undefined") {
      localStorage.setItem("tenant_code", loginCode);
    }

    // Direct redirect patungo sa Tenant Portal Dashboard
    router.push("/tenant/dashboard/home");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper p-4 sm:p-6 lg:p-8">
      {/* Container Box */}
      <div className="w-full max-w-md space-y-6">
        
        {/* Branding & Header */}
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

        {/* Main Form Card */}
        <div className="rounded-3xl border border-line bg-paper-card p-6 sm:p-8 shadow-md">
          <TenantLoginForm onSuccessLogin={handleSuccessfulLogin} />

          {/* Help Button Trigger */}
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

        {/* Footer info */}
        <Footer showNavLinks={false} />
      </div>

      {/* FAQ / Help Modal */}
      <LoginHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}