"use client";

import { CurrentSubscription } from "@/src/types/admin/subscription";

interface CurrentPlanBannerProps {
  subscription: CurrentSubscription;
  onUpgradeClick: () => void;
  onRetryPaymentClick?: () => void; // Idinagdag kung sakaling kailanganin ulit magbayad
}

export function CurrentPlanBanner({
  subscription,
  onUpgradeClick,
  onRetryPaymentClick,
}: CurrentPlanBannerProps) {
  const usagePercentage = Math.min(
    100,
    Math.round((subscription.unitsUsed / subscription.maxUnitsLimit) * 100)
  );

  const isPastDue = subscription.status === 'Past Due';

  return (
    <div className="relative overflow-hidden rounded-3xl border border-forest/25 bg-gradient-to-r from-forest via-forest-deep to-forest p-6 text-white shadow-lg sm:p-8">
      {/* Background Glow Effect */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-marigold/20 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-6">
        
        {/* KUNG NAG-FAIL ANG AUTO-RENEW (Past Due Alert) */}
        {isPastDue && (
          <div className="flex flex-col gap-3 rounded-2xl bg-red-500/20 border border-red-500/40 p-4 text-white backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500 text-white font-bold">⚠️</span>
              <div>
                <h4 className="font-bold text-sm text-red-200">Hindi natuloy ang Auto-Renew</h4>
                <p className="text-xs text-white/80">Nagka-problema sa pagbawas ng bayad sa iyong {subscription.paymentMethod}. Paki-update o bayaran ito manually.</p>
              </div>
            </div>
            {onRetryPaymentClick && (
              <button
                onClick={onRetryPaymentClick}
                className="rounded-xl bg-red-600 px-4 py-2 font-mono-brand text-xs font-bold text-white shadow transition-all hover:bg-red-700 active:scale-95 whitespace-nowrap"
              >
                Bayaran Ngayon
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left Side Info */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-marigold backdrop-blur-md">
              <span>✨</span> Kasalukuyang Plan
            </div>

            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-black sm:text-3xl">
                {subscription.planName}
              </h1>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                isPastDue 
                  ? 'bg-red-500/30 text-red-300 border border-red-500/50' 
                  : subscription.autoRenew 
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' 
                    : 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
              }`}>
                {isPastDue 
                  ? 'May Kulang sa Bayad' 
                  : subscription.autoRenew 
                    ? 'Aktibo (Auto-Renew)' 
                    : 'Aktibo (Manual Renew)'}
              </span>
            </div>

            <p className="text-xs text-white/80 sm:text-sm">
              {subscription.autoRenew ? (
                <>Awtomatikong magre-renew sa <span className="font-bold text-white">{subscription.renewsOn}</span> gamit ang <span className="underline decoration-marigold underline-offset-2">{subscription.paymentMethod}</span>.</>
              ) : (
                <>Magtatapos ang plan na ito sa <span className="font-bold text-white">{subscription.renewsOn}</span> (Naka-off ang auto-renew).</>
              )}
            </p>
          </div>

          {/* Right Side Usage Bar & Action */}
          <div className="flex flex-col gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-md lg:w-80 border border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono-brand font-bold text-white/80">Paggamit ng Unit</span>
              <span className="font-bold text-marigold">
                {subscription.unitsUsed} / {subscription.maxUnitsLimit} Units
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full bg-marigold transition-all duration-300"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>

            <button
              onClick={onUpgradeClick}
              className="w-full rounded-xl bg-coral py-2.5 font-mono-brand text-xs font-bold text-white shadow-md transition-all hover:bg-coral-deep active:scale-95"
            >
              I-upgrade ang Subscription
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}