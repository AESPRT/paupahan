"use client";

import { useState, useEffect, useTransition } from "react";
import { UtilitiesHeader } from "@/src/components/admin/utilities/UtilitiesHeader";
import { AssignBillModal } from "@/src/components/admin/utilities/AssignBillModal";
import { UtilityBillsList } from "@/src/components/admin/utilities/UtilityBillsList";
import { UtilityRate } from "@/src/types/admin/utility";
import { Footer } from "@/src/components/landing/Footer";
import { 
  getUtilitiesData, 
  updateUtilityRateAction 
} from "@/src/actions/utilities-actions";

export default function UtilitiesPage() {
  const [rates, setRates] = useState<UtilityRate[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Load data mula sa database kapag binuksan ang pahina (Rates na lang ang kinukuha)
  useEffect(() => {
    getUtilitiesData().then((data) => {
      setRates(data.rates as UtilityRate[]);
      setLoading(false);
    });
  }, []);

  // Update Rate Handler (Dynamic)
  const handleUpdateRate = async (id: string, newRate: number) => {
    // Optimistic UI update
    setRates((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ratePerUnit: newRate } : r))
    );
    
    startTransition(async () => {
      const result = await updateUtilityRateAction(id, newRate);
      if (!result.success) {
        alert(result.error);
        // Refresh para ibalik sa huling tamang data kung nagka-error
        const data = await getUtilitiesData();
        setRates(data.rates as UtilityRate[]);
      }
    });
  };

  // Handler kapag nag-submit mula sa rate update modal
  const handleSaveRateModal = async (dataPayload: { id: string; ratePerUnit: number }) => {
    await handleUpdateRate(dataPayload.id, dataPayload.ratePerUnit);
    setIsAssignModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <span className="text-sm font-medium text-muted">Nag-a-load ng utilities...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 p-4 sm:p-6 lg:p-8 ${isPending ? 'opacity-75 transition-opacity' : ''}`}>
      {/* Header & Global Rates - Pinalitan ang onAssignBill ng onOpenRateModal */}
      <UtilitiesHeader
        rates={rates}
        onUpdateRate={handleUpdateRate}
        onOpenRateModal={() => setIsAssignModalOpen(true)}
      />

      {/* Utility Rates List */}
      <UtilityBillsList 
        rates={rates} 
        onEditRate={(rate) => {
          setIsAssignModalOpen(true);
        }} 
      />

      {/* Rate Update Modal */}
      <AssignBillModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleSaveRateModal}
        currentRates={rates}
      />

      <Footer showNavLinks={false} />
    </div>
  );
}