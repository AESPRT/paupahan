"use client";

import { useState } from "react";
import { CurrentPlanBanner } from "@/src/components/admin/subscription/CurrentPlanBanner";
import { PricingCards } from "@/src/components/admin/subscription/PricingCards";
import { BillingSettings } from "@/src/components/admin/subscription/BillingSettings";
import { CurrentSubscription, SubscriptionPlan, PlanTier } from "@/src/types/admin/subscription";
import { Footer } from "@/src/components/landing/Footer";
import { PLANS } from "@/src/data/subscription";

const CURRENT_SUB: CurrentSubscription = {
  planName: "Panimula",
  status: "Active",
  renewsOn: "August 01, 2026",
  paymentMethod: "GCash",
  unitsUsed: 8,
  maxUnitsLimit: 15,
};

export default function SubscriptionPage() {
  const [currentSub] = useState<CurrentSubscription>(CURRENT_SUB);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    alert(`Gusto mong mag-subscribe sa ${plan.name} (₱${plan.priceMonthly}/mo)`);
  };

  const handleScrollToPricing = () => {
    const element = document.getElementById("pricing-section");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Current Active Plan Banner */}
      <CurrentPlanBanner
        subscription={currentSub}
        onUpgradeClick={handleScrollToPricing}
      />

      {/* Pricing Cards Section */}
      <div id="pricing-section">
        <PricingCards
          plans={PLANS}
          currentPlanName={currentSub.planName}
          onSelectPlan={handleSelectPlan}
        />
      </div>

      {/* Payment Methods & Receipts */}
      <BillingSettings />

      <Footer showNavLinks = {false} />
    </div>
  );
}