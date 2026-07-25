/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { getUnitsAndRoomsForTenantByTenantId, addTenantAction, updateTenantAction } from "@/src/actions/tenants-actions";
import { Tenant } from "@/src/types/tenant/tenant";

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTenantSaved: (tenant: Tenant) => void;
  tenantToEdit?: Tenant | null;
}

export function AddTenantModal({ isOpen, onClose, onTenantSaved, tenantToEdit }: AddTenantModalProps) {
  const [fullName, setFullName] = useState(tenantToEdit?.fullName || "");
  const [email, setEmail] = useState(tenantToEdit?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(tenantToEdit?.phone || "");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [advanceMonths, setAdvanceMonths] = useState<number>(tenantToEdit?.advanceMonths ?? 1);
  const [depositMonths, setDepositMonths] = useState<number>(tenantToEdit?.depositMonths ?? 1);
  
  const [unitsData, setUnitsData] = useState<any[]>([]);
  const [availableAmenities, setAvailableAmenities] = useState<any[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<{ [key: string]: { selected: boolean; amount: number } }>({});

  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const isEditMode = Boolean(tenantToEdit);

  // Ang useEffect na ito ay para lamang sa pagkuha ng external data mula sa server actions.
  // Ang pag-generate ng QR code ay ginawa nating asynchronous promise chaining para maiwasan ang synchronous setState sa linter.
  useEffect(() => {
    if (!isOpen) return;

    getUnitsAndRoomsForTenantByTenantId(tenantToEdit?.id).then((data: any) => {
      setUnitsData(data.unitsData || []);
      if (data.amenities) {
        setAvailableAmenities(data.amenities);
        const initialMap: any = {};
        data.amenities.forEach((item: any) => {
          const isAlreadyAssigned = tenantToEdit && data.currentTenantAmenities?.includes(item.id);
          initialMap[item.id] = { 
            selected: isAlreadyAssigned || false, 
            amount: Number(item.amount) 
          };
        });
        setSelectedAmenities(initialMap);
      }
    });

    if (tenantToEdit && tenantToEdit.loginCode) {
      const baseUrl = window.location.origin;
      const loginUrl = `${baseUrl}/tenant/login?code=${tenantToEdit.loginCode}`;
      QRCode.toDataURL(loginUrl, { width: 300, margin: 2 })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => {
          console.error("Error generating QR code:", err);
          setQrCodeUrl("");
        });
    } else {
      // Inalis ang direktang synchronous else block sa pamamagitan ng paggamit ng queueMicrotask
      queueMicrotask(() => setQrCodeUrl(""));
    }
  }, [isOpen, tenantToEdit]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || (!isEditMode && !selectedRoomId) || (!isEditMode && !startDate)) {
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

    let result;
    if (isEditMode && tenantToEdit) {
      result = await updateTenantAction({
        tenantId: tenantToEdit.id,
        fullName,
        email,
        phoneNumber,
        amenities: amenitiesPayload,
      });
    } else {
      result = await addTenantAction({
        fullName,
        email,
        phoneNumber,
        roomId: selectedRoomId,
        startDate,
        endDate: endDate || undefined,
        advanceMonths,
        depositMonths,
        amenities: amenitiesPayload,
      });
    }

    setLoading(false);

    const savedTenantData = (result as any).newTenant || (result as any).updatedTenant;
    if (result.success && savedTenantData) {
      onTenantSaved(savedTenantData);
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
    setQrCodeUrl("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl bg-paper-card p-6 shadow-2xl border border-line space-y-5 max-h-[90vh] overflow-y-auto">
        
        <div className="flex justify-between items-center border-b border-line pb-3">
          <div>
            <span className="inline-block px-3 py-1 mb-1 text-[10px] font-bold tracking-wider uppercase rounded-full bg-forest/10 text-forest">
              {isEditMode ? "✨ Pamamahala ng Tenant" : "🎉 Bagong Pakikipag-ugnayan"}
            </span>
            <h3 className="text-xl font-extrabold text-foreground">
              {isEditMode ? `I-edit si ${tenantToEdit?.fullName}` : "Magdagdag ng Bagong Tenant"}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            className="p-2 rounded-xl text-muted hover:bg-line/60 transition-all cursor-pointer"
            aria-label="Isara"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">Buong Pangalan</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Juan Dela Cruz"
              className="w-full rounded-xl border border-line bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-forest/50 transition-all shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@example.com"
                className="w-full rounded-xl border border-line bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-forest/50 transition-all shadow-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Telepono / Mobile Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+63 917 123 4567"
                className="w-full rounded-xl border border-line bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-forest/50 transition-all shadow-xs"
              />
            </div>
          </div>

          {!isEditMode && (
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Pumili ng Unit at Kwarto</label>
              <select
                required
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full rounded-xl border border-line bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-forest/50 transition-all cursor-pointer shadow-xs"
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
          )}

          {!isEditMode && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border border-line p-4 bg-background/60 shadow-inner">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Advance (Bilang ng Buwan)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={advanceMonths}
                  onChange={(e) => setAdvanceMonths(Number(e.target.value))}
                  className="w-full rounded-xl border border-line bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-forest/50"
                />
                <span className="text-[11px] font-medium text-forest mt-1 block">
                  Halaga: ₱{computedAdvanceAmount.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Deposit (Bilang ng Buwan)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={depositMonths}
                  onChange={(e) => setDepositMonths(Number(e.target.value))}
                  className="w-full rounded-xl border border-line bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-forest/50"
                />
                <span className="text-[11px] font-medium text-forest mt-1 block">
                  Halaga: ₱{computedDepositAmount.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {availableAmenities.length > 0 && (
            <div className="rounded-2xl border border-line p-4 bg-background/60 space-y-2.5 shadow-inner">
              <label className="block text-xs font-extrabold text-foreground">
                📦 Pamahalaan ang mga Amenities / Karagdagang Bayarin
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {availableAmenities.map((amenity) => {
                  const isChecked = selectedAmenities[amenity.id]?.selected || false;
                  const currentAmount = selectedAmenities[amenity.id]?.amount ?? Number(amenity.amount);

                  return (
                    <div key={amenity.id} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-paper-card p-2.5 shadow-xs transition-all hover:border-forest/40">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          id={`amenity-${amenity.id}`}
                          checked={isChecked}
                          onChange={() => handleAmenityToggle(amenity.id)}
                          className="h-4 w-4 rounded-md border-line text-forest focus:ring-forest cursor-pointer"
                        />
                        <label htmlFor={`amenity-${amenity.id}`} className="text-xs font-semibold text-foreground cursor-pointer">
                          {amenity.name} <span className="text-[10px] text-muted font-normal">({amenity.frequency})</span>
                        </label>
                      </div>

                      {isChecked && (
                        <div className="w-28">
                          <input
                            type="number"
                            value={currentAmount}
                            onChange={(e) => handleAmenityAmountChange(amenity.id, e.target.value)}
                            placeholder="Amount"
                            className="w-full rounded-lg border border-line bg-background px-2.5 py-1 text-xs text-right font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-forest"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isEditMode && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Simula ng Upa (Start Date)</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-line bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-forest/50 shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Katapusan ng Upa (Opsyonal)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-line bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-forest/50 shadow-xs"
                />
              </div>
            </div>
          )}

          {isEditMode && qrCodeUrl && (
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-background/50 border border-line">
              <p className="text-xs font-bold text-muted mb-2">Tenant Portal QR Code</p>
              <div className="rounded-xl bg-white p-2 border border-line shadow-sm">
                <Image src={qrCodeUrl} alt="Tenant QR Code" width={120} height={120} className="object-contain" />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-line">
            <button
              type="button"
              onClick={handleCloseModal}
              className="rounded-xl border border-line px-5 py-2.5 text-xs font-bold text-muted hover:bg-paper transition-all cursor-pointer"
            >
              Kanselahin
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-forest text-paper px-6 py-2.5 text-xs font-extrabold shadow-md hover:bg-forest-deep disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? "Binabago..." : isEditMode ? "I-save ang Pagbabago" : "I-save ang Tenant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}