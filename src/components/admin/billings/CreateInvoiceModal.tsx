"use client";

import { useState } from "react";
import { Invoice } from "@/src/types/admin/billing";

interface ActiveTenantRoom {
  roomId: string;
  roomNumber: string;
  unitName: string;
  tenantName: string;
  monthlyRent: number;
}

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (invoice: Omit<Invoice, "id" | "invoiceNumber">) => void;
  roomsWithTenants?: ActiveTenantRoom[]; // Listahan ng mga may active tenant
}

export function CreateInvoiceModal({
  isOpen,
  onClose,
  onCreate,
  roomsWithTenants = [],
}: CreateInvoiceModalProps) {
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [unitRoom, setUnitRoom] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [utilityAmount, setUtilityAmount] = useState("");

  // Kapag nagbago ang piniling room, auto-fill ang tenant name at default rent amount
  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId);
    const found = roomsWithTenants.find((r) => r.roomId === roomId);
    if (found) {
      setTenantName(found.tenantName);
      setUnitRoom(`${found.unitName} - Room ${found.roomNumber}`);
      setRentAmount(found.monthlyRent ? found.monthlyRent.toString() : "");
    } else {
      setTenantName("");
      setUnitRoom("");
      setRentAmount("");
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!tenantName || !unitRoom || !dueDate) return;

    const lineItems = [];
    let total = 0;

    if (rentAmount && Number(rentAmount) > 0) {
      lineItems.push({ description: "Buwanang Renta (Rent)", amount: Number(rentAmount) });
      total += Number(rentAmount);
    }

    if (utilityAmount && Number(utilityAmount) > 0) {
      lineItems.push({ description: "Utilities (Kuryente/Tubig)", amount: Number(utilityAmount) });
      total += Number(utilityAmount);
    }

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
    setSelectedRoomId("");
    setTenantName("");
    setUnitRoom("");
    setDueDate("");
    setRentAmount("");
    setUtilityAmount("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-line bg-paper-card p-6 shadow-xl animate-in fade-in zoom-in duration-200">
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
          {/* Dropdown para sa mga Occupied Rooms */}
          <div>
            <label className="block text-xs font-bold text-forest-deep mb-1">
              Pumili ng Kuwarto / Tenant (Occupied)
            </label>
            <select
              required
              value={selectedRoomId}
              onChange={(e) => handleRoomChange(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-3.5 py-2 text-xs font-medium text-ink outline-none focus:border-forest"
            >
              <option value="">-- Piliin ang Kuwarto at Tenant --</option>
              {roomsWithTenants.map((item) => (
                <option key={item.roomId} value={item.roomId}>
                  {item.unitName} - Room {item.roomNumber} ({item.tenantName})
                </option>
              ))}
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

          <div className="space-y-2 border-t border-line/60 pt-3">
            <span className="block font-mono-brand text-[11px] font-bold uppercase text-muted">
              Mga Isasama sa Singil (Line Items)
            </span>

            <div className="grid grid-cols-2 gap-2">
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

              <div>
                <label className="block text-[11px] font-medium text-muted mb-1">
                  Utilities / Iba pa (₱)
                </label>
                <input
                  type="number"
                  placeholder="1200"
                  value={utilityAmount}
                  onChange={(e) => setUtilityAmount(e.target.value)}
                  className="w-full rounded-xl border border-line bg-paper px-3.5 py-2 text-xs font-medium text-ink outline-none focus:border-forest"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
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