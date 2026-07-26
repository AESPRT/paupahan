/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useTransition } from "react";
import { UtilitiesHeader } from "@/src/components/admin/utilities/UtilitiesHeader";
import { AssignBillModal } from "@/src/components/admin/utilities/AssignBillModal";
import { UtilityBillsList } from "@/src/components/admin/utilities/UtilityBillsList";
import { AmenitiesManagerCard } from "@/src/components/admin/utilities/AmenitiesManagerCard";
import { AddAmenityModal } from "@/src/components/admin/utilities/AddAmenityModal";
import { UtilityRate } from "@/src/types/admin/utility";
import { 
  getUtilitiesData, 
  updateUtilityRateAction,
  createAmenityAction,
  deleteAmenityAction
} from "@/src/actions/utilities-actions";

interface UtilitiesClientWrapperProps {
  initialRates: UtilityRate[];
  initialAmenities: any[];
}

export function UtilitiesClientWrapper({ initialRates, initialAmenities }: UtilitiesClientWrapperProps) {
  const [rates, setRates] = useState<UtilityRate[]>(initialRates);
  const [amenities, setAmenities] = useState<any[]>(initialAmenities);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isAmenityModalOpen, setIsAmenityModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const refreshData = async () => {
    const data = await getUtilitiesData();
    setRates(data.rates as UtilityRate[]);
    setAmenities(data.amenities || []);
  };

  const handleUpdateRate = async (id: string, newRate: number) => {
    setRates((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ratePerUnit: newRate } : r))
    );
    
    startTransition(async () => {
      const result = await updateUtilityRateAction(id, newRate);
      if (!result.success) {
        alert(result.error);
        refreshData();
      }
    });
  };

  const handleSaveRateModal = async (dataPayload: { id: string; ratePerUnit: number }) => {
    await handleUpdateRate(dataPayload.id, dataPayload.ratePerUnit);
    setIsAssignModalOpen(false);
  };

  const handleCreateAmenity = async (formData: { name: string; amount: number; frequency: string; description?: string }) => {
    startTransition(async () => {
      const result = await createAmenityAction(formData);
      if (result.success) {
        setIsAmenityModalOpen(false);
        refreshData();
      } else {
        alert(result.error);
      }
    });
  };

  const handleDeleteAmenity = async (id: string) => {
    if (!confirm("Sigurado ka bang gusto mong tanggalin ang amenity na ito?")) return;
    
    startTransition(async () => {
      const result = await deleteAmenityAction(id);
      if (result.success) {
        refreshData();
      } else {
        alert(result.error);
      }
    });
  };

  return (
    <div className={`space-y-6 ${isPending ? 'opacity-75 transition-opacity' : ''}`}>
      <UtilitiesHeader
        rates={rates}
        onUpdateRate={handleUpdateRate}
        onOpenRateModal={() => setIsAssignModalOpen(true)}
      />

      <UtilityBillsList 
        rates={rates}
      />

      <div className="pt-4 border-t border-line">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-sm font-bold text-forest-deep uppercase tracking-wider">
              Pamamahala ng mga Amenities
            </h2>
            <p className="text-xs text-muted">Maaari kang magdagdag ng karagdagang bayarin tulad ng Aircon fee, Parking, atbp.</p>
          </div>
          <button
            onClick={() => setIsAmenityModalOpen(true)}
            className="rounded-xl bg-forest px-4 py-2 font-mono-brand text-xs font-bold text-white shadow-sm hover:bg-forest-deep transition-all"
          >
            + Magdagdag ng Amenity
          </button>
        </div>

        <AmenitiesManagerCard amenities={amenities} onDelete={handleDeleteAmenity} />
      </div>

      <AssignBillModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleSaveRateModal}
        currentRates={rates}
      />

      <AddAmenityModal
        isOpen={isAmenityModalOpen}
        onClose={() => setIsAmenityModalOpen(false)}
        onSubmit={handleCreateAmenity}
      />
    </div>
  );
}