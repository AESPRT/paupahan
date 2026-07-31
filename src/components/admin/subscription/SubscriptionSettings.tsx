"use client";

import { useState, useTransition } from "react";
import { CurrentSubscription } from "@/src/types/admin/subscription";

interface SubscriptionSettingsProps {
  subscription: CurrentSubscription;
  onAutoRenewToggle?: (newState: boolean) => Promise<void>;
  onChangePaymentMethod?: () => void;
}

export function SubscriptionSettings({
  subscription,
  onAutoRenewToggle,
  onChangePaymentMethod,
}: SubscriptionSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticAutoRenew, setOptimisticAutoRenew] = useState<boolean | null>(null);

  const autoRenew = optimisticAutoRenew ?? subscription.autoRenew ?? true;

  const handleToggle = () => {
    const nextState = !autoRenew;
    setOptimisticAutoRenew(nextState);

    startTransition(async () => {
      if (onAutoRenewToggle) {
        try {
          await onAutoRenewToggle(nextState);
        } catch (error) {
          console.error("Nabigong baguhin ang auto-renew status:", error);
          setOptimisticAutoRenew(null);
        }
      }
    });
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-xl transition-all duration-300 sm:p-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-forest/10 text-forest">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <div>
            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              Billing & Renewals
            </div>
            <h3 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              Mga Detalye ng Auto-Renew at Pagbabayad
            </h3>
            <p className="text-xs text-slate-500">
              Pamahalaan ang iyong awtomatikong pagbabayad at paraan ng paniningil.
            </p>
          </div>
        </div>

        {/* Auto-renew Toggle Switch */}
        <div className="flex items-center gap-3 self-end rounded-full border border-slate-200/80 bg-slate-50/80 px-4 py-2 sm:self-center">
          <span className="text-xs font-semibold text-slate-700">
            {autoRenew ? "Auto-Renew ON" : "Auto-Renew OFF"}
          </span>
          <button
            type="button"
            onClick={handleToggle}
            disabled={isPending}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 ${
              autoRenew ? "bg-slate-900" : "bg-slate-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                autoRenew ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2">
        {/* Payment Method Card */}
        <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/60 bg-slate-50/50 p-5 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <svg
                className="h-4 w-4 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Naka-save na Payment Method
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-900">
              {subscription.paymentMethod || "GCash / Credit Card (Naka-link)"}
            </p>

            {subscription.paymentNumber && (
              <p className="mt-1 font-mono text-xs text-slate-500">
                Numero/Account:{" "}
                <span className="font-semibold text-slate-700">
                  {subscription.paymentNumber}
                </span>
              </p>
            )}

            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Handang mangolekta sa susunod na siklo
            </div>
          </div>

          {onChangePaymentMethod && (
            <button
              onClick={onChangePaymentMethod}
              type="button"
              className="mt-5 inline-flex items-center gap-1 self-start text-xs font-semibold text-slate-900 transition-colors hover:text-slate-600 cursor-pointer"
            >
              <span>Baguhin ang Payment Method</span>
              <svg
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Next Billing Info Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/60 bg-slate-50/50 p-5 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <svg
                className="h-4 w-4 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Susunod na Singil
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-900">
              {subscription.renewsOn}
            </p>

            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              {autoRenew
                ? "Awtomatikong sisingilin ang iyong account sa takdang petsa."
                : "Hindi na ito magre-renew pagkalipas ng petsang ito maliban kung i-on mo muli."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}