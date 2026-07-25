"use client";

import { useState, useEffect, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CurrentPlanBanner } from "@/src/components/admin/subscription/CurrentPlanBanner";
import { SubscriptionSettings } from "@/src/components/admin/subscription/SubscriptionSettings";
import { PricingCards } from "@/src/components/admin/subscription/PricingCards";
import { PaymentMethodDialog } from "@/src/components/admin/subscription/PaymentMethodDialog";
import { CurrentSubscription, SubscriptionPlan } from "@/src/types/admin/subscription";
import { Footer } from "@/src/components/landing/Footer";
import { PLANS } from "@/src/data/subscription";
import { 
  getAdminSubscriptionData, 
  updateLandlordSubscriptionAction, 
  updateAutoRenewAction,
  updatePaymentMethodAction 
} from "@/src/actions/subscription-actions";

export default function SubscriptionPage() {
  const [currentSub, setCurrentSub] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [, startTransition] = useTransition();

  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. Saluhin ang pagbabalik mula sa PayMongo pagkatapos mag-success ang bayad
  useEffect(() => {
    const success = searchParams.get("success");
    const planNameParam = searchParams.get("planName");

    if (success === "true" && planNameParam) {
      async function handlePaymentSuccess() {
        try {
          const matchedPlan = PLANS.find(
            (p) => p.name.toLowerCase() === planNameParam?.toLowerCase() || 
                   p.tag.toLowerCase() === planNameParam?.toLowerCase()
          );

          if (matchedPlan) {
            const result = await updateLandlordSubscriptionAction(
              matchedPlan.name, 
              matchedPlan.maxUnits, 
              matchedPlan.maxRooms
            );

            if (result.success) {
              console.log("Tagumpay na na-update ang subscription pagkatapos magbayad!");
            }
          }

          const updatedResult = await getAdminSubscriptionData();
          if (updatedResult.success && updatedResult.subscription) {
            setCurrentSub(updatedResult.subscription as CurrentSubscription);
          }

          router.replace("/admin/dashboard/subscriptions", { scroll: false });
        } catch (error) {
          console.error("Nabigong i-update ang subscription pagkatapos magbayad:", error);
        }
      }

      handlePaymentSuccess();
    }
  }, [searchParams, router]);

  // 2. Kunin ang regular data mula sa database gamit ang useEffect
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
    if (confirm(`Gusto mo bang mag-subscribe sa ${plan.tag} plan (${plan.priceDisplay}/mo)?`)) {
      startTransition(async () => {
        const maxUnits = plan.maxUnits;
        const maxRooms = plan.maxRooms;

        const result = await updateLandlordSubscriptionAction(plan.name, maxUnits, maxRooms);
        if (result.success) {
          alert(`Tagumpay! Nagbago na ang iyong plan sa ${plan.tag}.`);
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

      {/* Auto-Renew & Payment Settings Component */}
      <SubscriptionSettings
        subscription={currentSub}
        onAutoRenewToggle={async (newState) => {
          const result = await updateAutoRenewAction(newState);
          if (!result.success) {
            throw new Error(result.error);
          }
        }}
        onChangePaymentMethod={() => setIsPaymentDialogOpen(true)}
      />

      {/* Pricing Cards Section */}
      <div id="pricing-section">
        <PricingCards
          plans={PLANS}
          currentPlanName={currentSub.planName}
          onSelectPlan={handleSelectPlan}
          userId={currentSub.userId} 
          customerInfo={{
            name: currentSub.userName || "",
            email: currentSub.userEmail || "",
            phone: currentSub.userPhone || "",
          }}
        />
      </div>

      {/* Payment Method Dialog Modal */}
      <PaymentMethodDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        onSave={async (method, number, paymentMethodId) => {
          const res = await updatePaymentMethodAction(method, number, paymentMethodId);
          if (res.success) {
            alert("Tagumpay na na-update ang iyong payment method at numero!");
            const updatedResult = await getAdminSubscriptionData();
            if (updatedResult.success && updatedResult.subscription) {
              setCurrentSub(updatedResult.subscription as CurrentSubscription);
            }
          } else {
            alert(res.error || "Nabigong i-update ang payment details.");
          }
        }}
      />

      <Footer showNavLinks={false} />
    </div>
  );
}