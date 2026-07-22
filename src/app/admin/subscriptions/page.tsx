"use client";

import { useState } from "react";
import { CurrentPlanBanner } from "@/src/components/admin/subscription/CurrentPlanBanner";
import { PricingCards } from "@/src/components/admin/subscription/PricingCards";
import { BillingSettings } from "@/src/components/admin/subscription/BillingSettings";
import { CurrentSubscription, SubscriptionPlan } from "@/src/types/subscription";
import { Footer } from "@/src/components/landing/Footer";

const CURRENT_SUB: CurrentSubscription = {
  planName: "Starter",
  status: "Active",
  renewsOn: "August 01, 2026",
  paymentMethod: "GCash",
  unitsUsed: 8,
  maxUnitsLimit: 15,
};

const PLANS: SubscriptionPlan[] = [
  {
    id: "plan-free",
    name: "Free Trial",
    priceMonthly: 0,
    maxUnits: "Hanggang 3 Units",
    features: ["Basic Tenant Management", "SMS Bill Reminders", "Community Support"],
  },
  {
    id: "plan-starter",
    name: "Starter",
    priceMonthly: 499,
    maxUnits: "Hanggang 15 Units",
    isPopular: true,
    features: [
      "Lahat ng nasa Free Trial",
      "Automatic Meter Readings",
      "PDF Receipt Downloads",
      "GCash & Maya Auto-Matching",
    ],
  },
  {
    id: "plan-pro",
    name: "Pro Plan",
    priceMonthly: 999,
    maxUnits: "Unlimited Units",
    features: [
      "Lahat ng nasa Starter Plan",
      "Multi-User (Para sa Staff)",
      "Advanced Financial Reports",
      "Priority Support 24/7",
    ],
  },
];

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