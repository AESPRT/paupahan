/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Invoice } from "@/src/types/admin/billing";

// Uri para sa mga Amenities na naka-assign o nakakabit sa kuwarto/unit/tenant
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
  amenities?: RoomAmenity[]; // 👈 Mga amenities para sa kuwarto/unit na ito
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
  // 💡 Ginamit ang leaseId bilang pangunahing identifier sa dropdown para saklaw ang parehong Room at Unit
  const [selectedLeaseId, setSelectedLeaseId] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [unitRoom, setUnitRoom] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  
  // State para sa mga napiling amenities at kani-kanilang halaga
  const [roomAmenities, setRoomAmenities] = useState<RoomAmenity[]>([]);

  // Kapag nagbago ang piniling lease, auto-fill ang tenant name, rent, at amenities
  const handleLeaseChange = (leaseId: string) => {
    setSelectedLeaseId(leaseId);
    const found = roomsWithTenants.find((r) => r.leaseId === leaseId);
    if (found) {
      setTenantName(found.tenantName);
      
      // 💡 Suriin kung ito ba ay buong unit o may kasamang room number
      if (found.roomNumber === "Buong Unit" || !found.roomId) {
        setUnitRoom(`${found.unitName} (Buong Unit)`);
      } else {
        setUnitRoom(`${found.unitName} - Room ${found.roomNumber}`);
      }

      setRentAmount(found.monthlyRent ? found.monthlyRent.toString() : "");
      setRoomAmenities(found.amenities || []); // 👈 Kunin ang amenities kung meron man
    } else {
      setTenantName("");
      setUnitRoom("");
      setRentAmount("");
      setRoomAmenities([]);
    }
  };

  // Handler para mabago ang amount ng specific amenity habang nasa modal (kung gusto i-edit ng landlord)
  const handleAmenityAmountChange = (id: string, amountStr: string) => {
    setRoomAmenities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, amount: Number(amountStr) || 0 } : item))
    );
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!tenantName || !unitRoom || !dueDate) return;

    const lineItems = [];
    let total = 0;

    // 1. Idagdag ang Renta kung meron
    if (rentAmount && Number(rentAmount) > 0) {
      lineItems.push({ description: "Buwanang Renta (Rent)", amount: Number(rentAmount) });
      total += Number(rentAmount);
    }

    // 2. ✨ Isama ang lahat ng nakasulat/na-set na Amenities sa Line Items at Total
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

    // Reset form
    setSelectedLeaseId("");
    setTenantName("");
    setUnitRoom("");
    setDueDate("");
    setRentAmount("");
    setRoomAmenities([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-line bg-paper-card p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <h2 className="font-display text-lg font-bold text-forest-deep">
            Lumikha ng Bagong Invoice
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted hover:bg-paper hover:text-ink"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Dropdown para sa mga Occupied Units/Rooms (Gamit ang leaseId) */}
          <div>
            <label className="block text-xs font-bold text-forest-deep mb-1">
              Pumili ng Property / Tenant (Occupied)
            </label>
            <select
              required
              value={selectedLeaseId}
              onChange={(e) => handleLeaseChange(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-3.5 py-2 text-xs font-medium text-ink outline-none focus:border-forest"
            >
              <option value="">-- Piliin ang Unit/Room at Tenant --</option>
              {roomsWithTenants.map((item) => {
                const displayText = item.roomNumber === "Buong Unit" || !item.roomId
                  ? `${item.unitName} (Buong Unit) - ${item.tenantName}`
                  : `${item.unitName} - Room ${item.roomNumber} (${item.tenantName})`;

                return (
                  <option key={item.leaseId} value={item.leaseId}>
                    {displayText}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Auto-filled Tenant Name & Due Date */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-forest-deep mb-1">
                Pangalan ng Tenant
              </label>
              <input
                type="text"
                required
                readOnly
                placeholder="Awtomatikong lalabas..."
                value={tenantName}
                className="w-full rounded-xl border border-line bg-paper/60 px-3.5 py-2 text-xs font-medium text-muted outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-forest-deep mb-1">
                Due Date
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-line bg-paper px-3.5 py-2 text-xs font-medium text-ink outline-none focus:border-forest"
              />
            </div>
          </div>

          {/* Seksyon para sa Renta at Utilities */}
          <div className="space-y-2 border-t border-line/60 pt-3">
            <span className="block font-mono-brand text-[11px] font-bold uppercase text-muted">
              Pangunahing Singil (Base Charges)
            </span>

            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-muted mb-1">
                  Renta (₱)
                </label>
                <input
                  type="number"
                  placeholder="6500"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value)}
                  className="w-full rounded-xl border border-line bg-paper px-3.5 py-2 text-xs font-medium text-ink outline-none focus:border-forest"
                />
              </div>
            </div>
          </div>

          {/* ✨ DITO LUMALABAS ANG MGA AMENITIES KUNG MERON MANANG NAKATAKDA SA UNIT/ROOM */}
          {roomAmenities.length > 0 && (
            <div className="space-y-2 border-t border-line/60 pt-3">
              <span className="block font-mono-brand text-[11px] font-bold uppercase text-forest">
                Mga Nakatalagang Amenities para sa Paupahang Ito
              </span>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {roomAmenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-paper/50 p-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-forest-deep truncate">{amenity.name}</p>
                      {amenity.frequency && (
                        <p className="text-[10px] text-muted">{amenity.frequency}</p>
                      )}
                    </div>
                    <div className="w-28 shrink-0">
                      <input
                        type="number"
                        value={amenity.amount}
                        onChange={(e) => handleAmenityAmountChange(amenity.id, e.target.value)}
                        className="w-full rounded-lg border border-line bg-paper px-2.5 py-1 text-xs font-medium text-ink text-right outline-none focus:border-forest"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-line/60">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-line px-4 py-2 text-xs font-bold text-muted hover:bg-paper"
            >
              Kanselahin
            </button>
            <button
              type="submit"
              className="rounded-xl bg-forest px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-forest-deep"
            >
              I-issue ang Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}