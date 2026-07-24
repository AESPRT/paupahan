"use client";

import { useState, useEffect, useTransition } from "react";
import { CurrentPlanBanner } from "@/src/components/admin/subscription/CurrentPlanBanner";
import { PricingCards } from "@/src/components/admin/subscription/PricingCards";
import { BillingSettings } from "@/src/components/admin/subscription/BillingSettings";
import { CurrentSubscription, SubscriptionPlan } from "@/src/types/admin/subscription";
import { Footer } from "@/src/components/landing/Footer";
import { PLANS } from "@/src/data/subscription";
import { getAdminSubscriptionData, updateLandlordSubscriptionAction } from "@/src/actions/subscription-actions";

export default function SubscriptionPage() {
  const [currentSub, setCurrentSub] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  // Kunin ang data mula sa database gamit ang useEffect
  useEffect(() => {
    async function loadData() {
      try {
        const result = await getAdminSubscriptionData();
        if (result.success && result.subscription) {
          setCurrentSub(result.subscription as CurrentSubscription);
        }
      } catch (error) {
        console.error("Nabigong i-load ang subscription data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    // 👈 Ginamit ang plan.tag o plan.name depende sa UI display mo
    if (confirm(`Gusto mo bang mag-subscribe sa ${plan.tag} plan (${plan.priceDisplay}/mo)?`)) {
      startTransition(async () => {
        // Tuwirang gamitin ang number values mula sa na-update na PLANS data
        const maxUnits = plan.maxUnits;
        const maxRooms = plan.maxRooms;

        // Ipinapasa na natin ang plan name, maxUnits, at maxRooms sa server action
        const result = await updateLandlordSubscriptionAction(plan.name, maxUnits, maxRooms);
        if (result.success) {
          alert(`Tagumpay! Nagbago na ang iyong plan sa ${plan.tag}.`);
          // Refresh data
          const updated = await getAdminSubscriptionData();
          if (updated.success && updated.subscription) {
            setCurrentSub(updated.subscription as CurrentSubscription);
          }
        } else {
          alert(result.error);
        }
      });
    }
  };

  const handleScrollToPricing = () => {
    const element = document.getElementById("pricing-section");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading || !currentSub) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <span className="text-sm font-medium text-muted">Nag-a-load ng subscription details...</span>
      </div>
    );
  }

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

      <Footer showNavLinks={false} />
    </div>
  );
}