/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { getUnitsAndRoomsForTenant, addTenantAction } from "@/src/actions/tenants-actions";
import { Tenant } from "@/src/types/tenant/tenant";

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTenantAdded: (newTenant: Tenant) => void;
}

export function AddTenantModal({ isOpen, onClose, onTenantAdded }: AddTenantModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [advanceMonths, setAdvanceMonths] = useState<number>(1);
  const [depositMonths, setDepositMonths] = useState<number>(1);
  
  const [unitsData, setUnitsData] = useState<any[]>([]);
  const [availableAmenities, setAvailableAmenities] = useState<any[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<{ [key: string]: { selected: boolean; amount: number } }>({});

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getUnitsAndRoomsForTenant().then((data: any) => {
        setUnitsData(data.unitsData || []);
        if (data.amenities) {
          setAvailableAmenities(data.amenities);
          const initialMap: any = {};
          data.amenities.forEach((item: any) => {
            initialMap[item.id] = { selected: false, amount: Number(item.amount) };
          });
          setSelectedAmenities(initialMap);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  let selectedRoomMonthlyRent = 0;
  if (selectedRoomId) {
    for (const unit of unitsData) {
      const foundRoom = unit.rooms.find((r: any) => r.id === selectedRoomId);
      if (foundRoom) {
        selectedRoomMonthlyRent = Number(foundRoom.monthlyRent) || 0;
        break;
      }
    }
  }

  const computedAdvanceAmount = selectedRoomMonthlyRent * advanceMonths;
  const computedDepositAmount = selectedRoomMonthlyRent * depositMonths;

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities(prev => ({
      ...prev,
      [amenityId]: {
        ...prev[amenityId],
        selected: !prev[amenityId].selected,
      }
    }));
  };

  const handleAmenityAmountChange = (amenityId: string, val: string) => {
    setSelectedAmenities(prev => ({
      ...prev,
      [amenityId]: {
        ...prev[amenityId],
        amount: Number(val) || 0,
      }
    }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!fullName || !selectedRoomId || !startDate) {
      alert("Pakiusap na punan ang mga pangunahing impormasyon (Pangalan, Kwarto, at Simula ng Upa).");
      return;
    }

    const amenitiesPayload = Object.entries(selectedAmenities)
      .filter(([_, data]) => data.selected)
      .map(([amenityId, data]) => ({
        amenityId,
        amount: data.amount,
        quantity: 1,
      }));

    setLoading(true);
    const result = await addTenantAction({
      fullName,
      email,
      phoneNumber,
      roomId: selectedRoomId,
      startDate,
      endDate: endDate || undefined,
      advanceMonths,
      depositMonths,
      amenities: amenitiesPayload, // 👈 Ipinapasa na rito ang mga napiling amenities
    });
    setLoading(false);

    if (result.success && result.newTenant) {
      onTenantAdded(result.newTenant);
      handleCloseModal();
    } else {
      alert(result.error || "May naganap na error.");
    }
  };

  const handleCloseModal = () => {
    setFullName("");
    setEmail("");
    setPhoneNumber("");
    setSelectedRoomId("");
    setStartDate("");
    setEndDate("");
    setAdvanceMonths(1);
    setDepositMonths(1);
    setSelectedAmenities({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-paper-card p-6 shadow-xl border border-line space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-foreground">Magdagdag ng Bagong Tenant</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Buong Pangalan</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Juan Dela Cruz"
              className="w-full rounded-lg border border-line bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@example.com"
                className="w-full rounded-lg border border-line bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Telepono / Mobile Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+63 917 123 4567"
                className="w-full rounded-lg border border-line bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">Pumili ng Unit at Kwarto</label>
            <select
              required
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full rounded-lg border border-line bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="">-- Pumili ng Kwarto --</option>
              {unitsData.map((unit) => (
                <optgroup key={unit.id} label={unit.name}>
                  {unit.rooms.map((room: any) => (
                    <option key={room.id} value={room.id}>
                      Room {room.roomNumber} (₱{Number(room.monthlyRent).toLocaleString()})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Advance at Deposit Months Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-line p-3 bg-background/50">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Advance (Bilang ng Buwan)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                required
                value={advanceMonths}
                onChange={(e) => setAdvanceMonths(Number(e.target.value))}
                className="w-full rounded-lg border border-line bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-[11px] text-muted mt-1 block">
                Halaga: ₱{computedAdvanceAmount.toLocaleString()}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1">Deposit (Bilang ng Buwan)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                required
                value={depositMonths}
                onChange={(e) => setDepositMonths(Number(e.target.value))}
                className="w-full rounded-lg border border-line bg-background p-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-[11px] text-muted mt-1 block">
                Halaga: ₱{computedDepositAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* ✨ AMENITIES SELECTION LIST */}
          {availableAmenities.length > 0 && (
            <div className="rounded-xl border border-line p-3 bg-background/50 space-y-2">
              <label className="block text-xs font-bold text-foreground mb-1">
                Maglakip ng mga Amenities / Karagdagang Bayarin (Opsyonal)
              </label>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {availableAmenities.map((amenity) => {
                  const isChecked = selectedAmenities[amenity.id]?.selected || false;
                  const currentAmount = selectedAmenities[amenity.id]?.amount ?? Number(amenity.amount);

                  return (
                    <div key={amenity.id} className="flex items-center justify-between gap-2 rounded-lg border border-line bg-background p-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`amenity-${amenity.id}`}
                          checked={isChecked}
                          onChange={() => handleAmenityToggle(amenity.id)}
                          className="h-4 w-4 rounded border-line text-primary focus:ring-primary cursor-pointer"
                        />
                        <label htmlFor={`amenity-${amenity.id}`} className="text-xs font-medium text-foreground cursor-pointer">
                          {amenity.name} <span className="text-[10px] text-muted">({amenity.frequency})</span>
                        </label>
                      </div>

                      {isChecked && (
                        <div className="w-24">
                          <input
                            type="number"
                            value={currentAmount}
                            onChange={(e) => handleAmenityAmountChange(amenity.id, e.target.value)}
                            placeholder="Amount"
                            className="w-full rounded border border-line bg-background px-2 py-1 text-xs text-right text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Simula ng Upa (Start Date)</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-line bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Katapusan ng Upa (End Date - Opsyonal)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-line bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-muted hover:bg-paper cursor-pointer"
            >
              Kanselahin
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-forest text-paper px-5 py-2 text-sm font-semibold shadow-sm hover:bg-forest-deep disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? "Gumagawa..." : "I-save ang Tenant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}