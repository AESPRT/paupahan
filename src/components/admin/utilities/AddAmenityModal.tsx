"use client";

import { useState } from "react";

interface AddAmenityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; amount: number; frequency: string; description?: string }) => void;
}

export function AddAmenityModal({ isOpen, onClose, onSubmit }: AddAmenityModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("Buwanan");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !amount) return;

    onSubmit({
      name,
      amount: parseFloat(amount),
      frequency,
      description,
    });

    // Reset form
    setName("");
    setAmount("");
    setDescription("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-line bg-paper-card p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h3 className="font-display text-base font-bold text-forest-deep">Magdagdag ng Amenity</h3>
          <button onClick={onClose} className="text-muted hover:text-forest-deep font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-forest-deep mb-1">Pangalan ng Amenity (Hal. Aircon Fee, Parking)</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Hal. Parking Space"
              className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-deep mb-1">Halaga (₱)</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-deep mb-1">Dalas (Frequency)</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-forest"
            >
              <option value="Buwanan">Buwanan (Monthly)</option>
              <option value="Isang Beses">Isang Beses (One-time)</option>
              <option value="Taunan">Taunan (Yearly)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-forest-deep mb-1">Deskripsyon (Opsyonal)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Maikling paliwanag..."
              rows={2}
              className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
              I-save ang Amenity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}