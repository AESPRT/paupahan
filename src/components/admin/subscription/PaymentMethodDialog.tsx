"use client";

import { useState } from "react";

interface PaymentMethodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (paymentMethod: string, paymentNumber: string, paymentMethodId?: string) => Promise<void>;
}

export function PaymentMethodDialog({ isOpen, onClose, onSave }: PaymentMethodDialogProps) {
  const [method, setMethod] = useState("GCash");
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!number) {
      alert("Mangyaring ilagay ang iyong numero o account details.");
      return;
    }

    setLoading(true);
    try {
      const dummyPaymentMethodId = `pm_${Date.now()}`; 
      
      await onSave(method, number, dummyPaymentMethodId);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-paper-card p-6 shadow-xl border border-line">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <h3 className="text-lg font-black text-ink font-display">
            I-update ang Payment Method
          </h3>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 text-muted hover:bg-paper transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2 font-mono-brand">
              Uri ng Pagbabayad
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm font-bold text-ink focus:ring-2 focus:ring-marigold outline-none font-body"
            >
              <option value="GCash">GCash</option>
              <option value="Credit Card">Credit Card / Debit Card</option>
              <option value="Maya">Maya</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2 font-mono-brand">
              {method === "GCash" || method === "Maya" ? "Mobile Number" : "Card Number / Account ID"}
            </label>
            <input
              type="text"
              placeholder={method === "GCash" ? "09123456789" : "1234-5678-9012-3456"}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm font-bold text-ink focus:ring-2 focus:ring-marigold outline-none font-mono-brand"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl bg-paper border border-line py-3 text-xs font-bold text-muted hover:bg-line/40 transition-colors font-mono-brand"
            >
              Kanselahin
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-2xl bg-forest py-3 text-xs font-bold text-paper-card shadow-md hover:bg-forest-deep disabled:opacity-50 transition-colors font-mono-brand"
            >
              {loading ? "Nagse-save..." : "I-save ang Paraan"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}