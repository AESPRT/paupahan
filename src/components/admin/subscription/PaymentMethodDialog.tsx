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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!number) {
      alert("Mangyaring ilagay ang iyong numero o account details.");
      return;
    }

    setLoading(true);
    try {
      // Dito mo pwedeng isama ang integration sa PayMongo para kumuha ng paymentMethodId kung kinakailangan
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
          <h3 className="text-lg font-black text-gray-900 dark:text-white font-display">
            I-update ang Payment Method
          </h3>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Uri ng Pagbabayad
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="GCash">GCash</option>
              <option value="Credit Card">Credit Card / Debit Card</option>
              <option value="Maya">Maya</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              {method === "GCash" || method === "Maya" ? "Mobile Number" : "Card Number / Account ID"}
            </label>
            <input
              type="text"
              placeholder={method === "GCash" ? "09123456789" : "1234-5678-9012-3456"}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl bg-gray-100 py-3 text-xs font-bold text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Kanselahin
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Nagse-save..." : "I-save ang Paraan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}