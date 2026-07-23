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
  
  // 👈 Mga bagong state para sa Advance at Deposit months
  const [advanceMonths, setAdvanceMonths] = useState<number>(1);
  const [depositMonths, setDepositMonths] = useState<number>(1);
  
  const [unitsData, setUnitsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getUnitsAndRoomsForTenant().then((data) => setUnitsData(data));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Hanapin ang napiling room para makuha ang monthly rent nito sa pag-compute
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

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!fullName || !selectedRoomId || !startDate) {
      alert("Pakiusap na punan ang mga pangunahing impormasyon (Pangalan, Kwarto, at Simula ng Upa).");
      return;
    }

    setLoading(true);
    const result = await addTenantAction({
      fullName,
      email,
      phoneNumber,
      roomId: selectedRoomId,
      startDate,
      endDate: endDate || undefined,
      advanceMonths, // 👈 Ipinapasa sa server action
      depositMonths, // 👈 Ipinapasa sa server action
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
                      Room {room.roomNumber} (₱{Number(room.monthlyRent).toLocaleString()}) {room.status === 'vacant' ? '- Vacant' : '- Occupied'}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* 👈 Advance at Deposit Months Inputs */}
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