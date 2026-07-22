"use client";

import { useState } from "react";
import { RoomUtilityBill, UtilityType } from "@/src/types/utility";

interface AssignBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (bill: Omit<RoomUtilityBill, "id">) => void;
}

export function AssignBillModal({
  isOpen,
  onClose,
  onAssign,
}: AssignBillModalProps) {
  const [unitName, setUnitName] = useState("Building A");
  const [roomNumber, setRoomNumber] = useState("Room 101");
  const [tenantName, setTenantName] = useState("");
  const [type, setType] = useState<UtilityType>("electricity");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName || !amount || !dueDate) return;

    onAssign({
      unitName,
      roomNumber,
      tenantName,
      type,
      totalAmount: Number(amount),
      dueDate,
      status: "Pending",
    });

    setTenantName("");
    setAmount("");
    setDueDate("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-line bg-paper-card p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <h2 className="font-display text-lg font-bold text-forest-deep">
            Mag-assign ng Bill sa Kwarto
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted hover:bg-paper hover:text-ink"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Unit & Room Selector */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-forest-deep mb-1">
                Unit / Building
              </label>
              <select
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs font-medium text-ink outline-none"
              >
                <option value="Building A">Building A</option>
                <option value="Building B">Building B</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-forest-deep mb-1">
                Kwarto
              </label>
              <select
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs font-medium text-ink outline-none"
              >
                <option value="Room 101">Room 101</option>
                <option value="Room 102">Room 102</option>
                <option value="Room 201">Room 201</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-deep mb-1">
              Pangalan ng Tenant
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Juan Dela Cruz"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-3.5 py-2 text-xs font-medium text-ink outline-none focus:border-forest"
            />
          </div>

          {/* Type & Amount */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-forest-deep mb-1">
                Uri ng Bill
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as UtilityType)}
                className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs font-medium text-ink outline-none"
              >
                <option value="electricity">⚡ Kuryente</option>
                <option value="water">💧 Tubig</option>
                <option value="internet">🌐 Internet</option>
                <option value="amenities">🧹 Amenities</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-forest-deep mb-1">
                Halaga (₱)
              </label>
              <input
                type="number"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-line bg-paper px-3.5 py-2 text-xs font-medium text-ink outline-none focus:border-forest"
              />
            </div>
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

          <div className="flex items-center justify-end gap-2 pt-3">
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
              I-assign ang Bill
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}