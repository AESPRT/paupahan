"use client";

import { CurrentSubscription } from "@/src/types/subscription";

interface CurrentPlanBannerProps {
  subscription: CurrentSubscription;
  onUpgradeClick: () => void;
}

export function CurrentPlanBanner({
  subscription,
  onUpgradeClick,
}: CurrentPlanBannerProps) {
  const usagePercentage = Math.min(
    100,
    Math.round((subscription.unitsUsed / subscription.maxUnitsLimit) * 100)
  );

  return (
    <div className="relative overflow-hidden rounded-3xl border border-forest/20 bg-gradient-to-r from-forest via-forest-deep to-forest p-6 text-white shadow-md sm:p-8">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-marigold/20 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Side Info */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-marigold backdrop-blur-md">
            <span>✨</span> Kasalukuyang Plan
          </div>

          <h1 className="font-display text-2xl font-black sm:text-3xl">
            {subscription.planName}
          </h1>

          <p className="text-xs text-white/80 sm:text-sm">
            Awtomatikong magfe-renew sa <span className="font-bold text-white">{subscription.renewsOn}</span> gamit ang {subscription.paymentMethod}.
          </p>
        </div>

        {/* Right Side Usage Bar & Action */}
        <div className="flex flex-col gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-md lg:w-80">
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
  );
}