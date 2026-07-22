"use client";

import { TenantDashboardData } from "@/src/types/tenant-dashboard";

interface PaymentMethodsCardProps {
  payments: TenantDashboardData["landlordPayments"];
}

export function PaymentMethodsCard({ payments }: PaymentMethodsCardProps) {
  return (
    <div className="rounded-3xl border border-line bg-paper-card p-5 sm:p-6 shadow-sm space-y-4">
      <div className="border-b border-line pb-3 flex items-center gap-2.5">
        {/* Credit Card / Payment Header SVG Icon */}
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest/10 text-forest shrink-0">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-forest-deep">
            Paano Magbayad (Landlord Payment Channels)
          </h2>
          <p className="text-[11px] text-muted">
            Mag-send ng bayad sa alinman sa mga sumusunod at mag-upload ng resibo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {payments.gcash && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/30 p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-blue-600 font-display text-xs font-bold">
              {/* Smartphone SVG Icon */}
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>GCash</span>
            </div>
            <p className="font-mono-brand text-xs font-bold text-forest-deep">{payments.gcash.number}</p>
            <p className="text-[11px] text-muted">Name: {payments.gcash.name}</p>
          </div>
        )}

        {payments.bank && (
          <div className="rounded-2xl border border-line bg-paper p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-forest font-display text-xs font-bold">
              {/* Building / Bank SVG Icon */}
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
              <span>{payments.bank.bankName}</span>
            </div>
            <p className="font-mono-brand text-xs font-bold text-forest-deep">{payments.bank.accountNumber}</p>
            <p className="text-[11px] text-muted">Account Name: {payments.bank.accountName}</p>
          </div>
        )}
      </div>
    </div>
  );
}