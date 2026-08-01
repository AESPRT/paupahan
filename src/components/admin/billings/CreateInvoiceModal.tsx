"use client";

import { useState, useRef, useEffect } from "react";
import { Invoice } from "@/src/types/admin/billing";
import { calculateTenantDueDate } from "@/src/utils/calculateDueDate";

interface RoomAmenity {
  id: string;
  name: string;
  amount: number;
  frequency?: string;
}

interface ActiveTenantRoom {
  leaseId: string;
  roomId?: string | null;
  unitId?: string | null;
  roomNumber: string;
  unitName: string;
  tenantName: string;
  monthlyRent: number;
  amenities?: RoomAmenity[];
  dueDate?: number | string | null;
  dueDay?: number | string | null;
  movedInDate?: string | Date | null;
  startDate?: string | Date | null;
  currentBillStatus?: string;
}

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (invoice: Omit<Invoice, "id" | "invoiceNumber">) => void;
  roomsWithTenants?: ActiveTenantRoom[];
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  onCreate,
  roomsWithTenants = [],
}: CreateInvoiceModalProps) {
  const [selectedLeaseId, setSelectedLeaseId] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [unitRoom, setUnitRoom] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [rentAmount, setRentAmount] = useState("");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [roomAmenities, setRoomAmenities] = useState<RoomAmenity[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLeaseSelect = (item: ActiveTenantRoom) => {
    // 🛑 Huwag hayaang mapili kung may bill na o nakabayad na
    if (item.currentBillStatus === "paid" || item.currentBillStatus === "unpaid" || item.currentBillStatus === "pending") {
      return;
    }

    setSelectedLeaseId(item.leaseId);
    setTenantName(item.tenantName);

    if (item.roomNumber === "Buong Unit" || !item.roomId) {
      setUnitRoom(`${item.unitName} (Buong Unit)`);
    } else {
      setUnitRoom(`${item.unitName} - Room ${item.roomNumber}`);
    }

    setRentAmount(item.monthlyRent ? item.monthlyRent.toString() : "");
    setRoomAmenities(item.amenities || []);

    const computedDueDate = calculateTenantDueDate(item);
    setDueDate(computedDueDate);
    setIsDropdownOpen(false);
  };

  const handleAmenityAmountChange = (id: string, amountStr: string) => {
    setRoomAmenities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, amount: Number(amountStr) || 0 } : item))
    );
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName || !unitRoom || !dueDate) return;

    const lineItems = [];
    let total = 0;

    if (rentAmount && Number(rentAmount) > 0) {
      lineItems.push({ description: "Buwanang Renta (Rent)", amount: Number(rentAmount) });
      total += Number(rentAmount);
    }

    roomAmenities.forEach((amenity) => {
      if (amenity.amount > 0) {
        lineItems.push({
          description: `Amenity: ${amenity.name}${amenity.frequency ? ` (${amenity.frequency})` : ""}`,
          amount: amenity.amount,
        });
        total += amenity.amount;
      }
    });

    const today = new Date().toISOString().split("T")[0];

    onCreate({
      tenantName,
      unitRoom,
      issueDate: today,
      dueDate,
      lineItems,
      totalAmount: total,
      status: "Pending",
    });

    setSelectedLeaseId("");
    setTenantName("");
    setUnitRoom("");
    setDueDate("");
    setRentAmount("");
    setRoomAmenities([]);
    setIsDropdownOpen(false);
    onClose();
  };

  const selectedItem = roomsWithTenants.find((r) => r.leaseId === selectedLeaseId);

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-500/20">
            Nakabayad Na (Paid)
          </span>
        );
      case "unpaid":
      case "pending":
        return (
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 border border-amber-500/20">
            May Bill Pa (Unpaid)
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-medium text-muted border border-line">
            Wala Pang Bill
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-md transition-all">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-line bg-paper-card p-7 shadow-2xl shadow-forest-deep/5 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between border-b border-line/80 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight text-forest-deep">
              Lumikha ng Bagong Invoice
            </h2>
            <p className="text-[11px] font-medium text-muted mt-0.5">
              Mag-generate ng singil para sa mga aktibong tenant at unit ngayong buwan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-paper border border-line text-muted hover:bg-forest hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Custom Dropdown para sa mga Occupied Units/Rooms */}
          <div className="space-y-1.5 relative" ref={dropdownRef}>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-forest-deep">
              Pumili ng Property / Tenant
            </label>
            
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between rounded-2xl border border-line bg-paper px-4 py-2.5 text-xs font-medium text-ink outline-none transition-all hover:border-forest focus:border-forest focus:ring-2 focus:ring-forest/10 cursor-pointer text-left"
            >
              <span className={selectedItem ? "text-ink font-semibold" : "text-muted"}>
                {selectedItem
                  ? (selectedItem.roomNumber === "Buong Unit" || !selectedItem.roomId
                      ? `${selectedItem.unitName} (Buong Unit) — ${selectedItem.tenantName}`
                      : `${selectedItem.unitName} • Room ${selectedItem.roomNumber} — ${selectedItem.tenantName}`)
                  : "-- Piliin ang Unit/Room at Tenant --"}
              </span>
              <svg 
                className={`h-4 w-4 text-muted transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Custom Dropdown Menu Options */}
            {isDropdownOpen && (
              <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-2xl border border-line bg-paper-card shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="max-h-60 overflow-y-auto p-1.5 space-y-1">
                  {roomsWithTenants.length === 0 ? (
                    <div className="py-3 text-center text-xs text-muted">Walang nakitang occupied units.</div>
                  ) : (
                    roomsWithTenants.map((item) => {
                      const isSelected = item.leaseId === selectedLeaseId;
                      const hasExistingBill = item.currentBillStatus === "paid" || item.currentBillStatus === "unpaid" || item.currentBillStatus === "pending";
                      
                      const displayText = item.roomNumber === "Buong Unit" || !item.roomId
                        ? `${item.unitName} (Buong Unit)`
                        : `${item.unitName} • Room ${item.roomNumber}`;

                      return (
                        <div
                          key={item.leaseId}
                          onClick={() => handleLeaseSelect(item)}
                          className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs transition-colors ${
                            hasExistingBill
                              ? "opacity-50 cursor-not-allowed bg-paper/30 select-none" // 👈 Disabled style kung may bill na
                              : isSelected 
                                ? "bg-forest/10 text-forest-deep font-bold cursor-pointer" 
                                : "text-ink hover:bg-paper cursor-pointer"
                          }`}
                        >
                          <div className="space-y-1 min-w-0 pr-2">
                            <p className={`font-semibold truncate ${hasExistingBill ? "text-muted line-through" : ""}`}>
                              {displayText}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] text-muted">Tenant: {item.tenantName}</span>
                              {renderStatusBadge(item.currentBillStatus)}
                            </div>
                          </div>

                          {/* Check Icon kapag napili (Huwag ipakita kung disabled) */}
                          {isSelected && !hasExistingBill && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-forest text-white shrink-0">
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Auto-filled Tenant Name & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-forest-deep">
                Pangalan ng Tenant
              </label>
              <input
                type="text"
                required
                readOnly
                placeholder="Awtomatikong lalabas..."
                value={tenantName}
                className="w-full rounded-2xl border border-line bg-paper/60 px-4 py-2.5 text-xs font-medium text-muted outline-none cursor-not-allowed select-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-forest-deep">
                Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-2xl border border-line bg-paper px-4 py-2.5 text-xs font-medium text-ink outline-none transition-all focus:border-forest focus:ring-2 focus:ring-forest/10"
              />
            </div>
          </div>

          {/* Seksyon para sa Renta */}
          <div className="space-y-2 pt-2 border-t border-line/60">
            <span className="block font-mono-brand text-[10px] font-bold uppercase tracking-wider text-muted">
              Pangunahing Singil (Base Charges)
            </span>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-muted">
                Buwanang Renta (₱)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-xs font-bold text-muted">₱</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value)}
                  className="w-full rounded-2xl border border-line bg-paper pl-8 pr-4 py-2.5 text-xs font-medium text-ink outline-none transition-all focus:border-forest focus:ring-2 focus:ring-forest/10"
                />
              </div>
            </div>
          </div>

          {/* Amenities Section */}
          {roomAmenities.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-line/60">
              <div className="flex items-center justify-between">
                <span className="block font-mono-brand text-[10px] font-bold uppercase tracking-wider text-forest">
                  Mga Nakatalagang Amenities
                </span>
                <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-bold text-forest">
                  {roomAmenities.length}
                </span>
              </div>

              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {roomAmenities.map((amenity) => (
                  <div 
                    key={amenity.id} 
                    className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-paper/50 p-3 transition-all hover:bg-paper"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-forest-deep truncate">{amenity.name}</p>
                      {amenity.frequency && (
                        <p className="text-[10px] font-medium text-muted mt-0.5">{amenity.frequency}</p>
                      )}
                    </div>
                    <div className="w-32 shrink-0 relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[11px] font-bold text-muted">₱</span>
                      <input
                        type="number"
                        value={amenity.amount}
                        onChange={(e) => handleAmenityAmountChange(amenity.id, e.target.value)}
                        className="w-full rounded-xl border border-line bg-paper pl-7 pr-3 py-1.5 text-xs font-medium text-ink text-right outline-none transition-all focus:border-forest focus:ring-2 focus:ring-forest/10"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-line/60">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-line px-5 py-2.5 text-xs font-bold text-muted hover:bg-paper hover:text-ink transition-colors cursor-pointer"
            >
              Kanselahin
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-forest px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-forest-deep transition-all active:scale-[0.98] cursor-pointer"
            >
              I-issue ang Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}