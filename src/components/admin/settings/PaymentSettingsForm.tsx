"use client";

import { useState } from "react";
import { PaymentGatewaySettings } from "@/src/types/settings";

interface PaymentSettingsProps {
  initialData: PaymentGatewaySettings;
  onSave: (data: PaymentGatewaySettings) => void;
}

export function PaymentSettingsForm({ initialData, onSave }: PaymentSettingsProps) {
  const [formData, setFormData] = useState<PaymentGatewaySettings>(initialData);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-line bg-paper-card p-5 sm:p-7 shadow-sm">
      <div>
        <h2 className="font-display text-lg font-bold text-forest-deep">
          Paraan ng Pagtanggap ng Bayad (Payment Methods)
        </h2>
        <p className="text-xs text-muted">
          Ito ang mga detalye ng GCash, Maya, o Bank Account na makikita ng tenants sa kanilang bill.
        </p>
      </div>

      {/* GCash Section */}
      <div className="space-y-3 rounded-2xl border border-line/80 bg-paper p-4">
        <div className="flex items-center justify-between">
          <span className="font-display text-xs font-bold text-blue-600">📱 GCash Payment</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isGcashActive}
              onChange={(e) => setFormData({ ...formData, isGcashActive: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-forest"></div>
          </label>
        </div>

        {formData.isGcashActive && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
            <input
              type="text"
              placeholder="GCash Number (e.g. 09171234567)"
              value={formData.gcashNumber}
              onChange={(e) => setFormData({ ...formData, gcashNumber: e.target.value })}
              className="rounded-xl border border-line bg-paper-card px-3 py-2 text-xs font-medium text-ink outline-none"
            />
            <input
              type="text"
              placeholder="Account Name (e.g. Juan D.)"
              value={formData.gcashName}
              onChange={(e) => setFormData({ ...formData, gcashName: e.target.value })}
              className="rounded-xl border border-line bg-paper-card px-3 py-2 text-xs font-medium text-ink outline-none"
            />
          </div>
        )}
      </div>

      {/* Maya Section */}
      <div className="space-y-3 rounded-2xl border border-line/80 bg-paper p-4">
        <div className="flex items-center justify-between">
          <span className="font-display text-xs font-bold text-emerald-600">💚 Maya Payment</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isMayaActive}
              onChange={(e) => setFormData({ ...formData, isMayaActive: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-forest"></div>
          </label>
        </div>

        {formData.isMayaActive && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
            <input
              type="text"
              placeholder="Maya Number"
              value={formData.mayaNumber}
              onChange={(e) => setFormData({ ...formData, mayaNumber: e.target.value })}
              className="rounded-xl border border-line bg-paper-card px-3 py-2 text-xs font-medium text-ink outline-none"
            />
            <input
              type="text"
              placeholder="Account Name"
              value={formData.mayaName}
              onChange={(e) => setFormData({ ...formData, mayaName: e.target.value })}
              className="rounded-xl border border-line bg-paper-card px-3 py-2 text-xs font-medium text-ink outline-none"
            />
          </div>
        )}
      </div>

      {/* Bank Transfer Section */}
      <div className="space-y-3 rounded-2xl border border-line/80 bg-paper p-4">
        <div className="flex items-center justify-between">
          <span className="font-display text-xs font-bold text-forest-deep">🏦 Bank Transfer</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isBankActive}
              onChange={(e) => setFormData({ ...formData, isBankActive: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-forest"></div>
          </label>
        </div>

        {formData.isBankActive && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2">
            <input
              type="text"
              placeholder="Bank Name (BDO, BPI, etc.)"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              className="rounded-xl border border-line bg-paper-card px-3 py-2 text-xs font-medium text-ink outline-none"
            />
            <input
              type="text"
              placeholder="Account Number"
              value={formData.bankAccountNo}
              onChange={(e) => setFormData({ ...formData, bankAccountNo: e.target.value })}
              className="rounded-xl border border-line bg-paper-card px-3 py-2 text-xs font-medium text-ink outline-none"
            />
            <input
              type="text"
              placeholder="Account Name"
              value={formData.bankAccountName}
              onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
              className="rounded-xl border border-line bg-paper-card px-3 py-2 text-xs font-medium text-ink outline-none"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-line/60 pt-4">
        {saved ? (
          <span className="text-xs font-bold text-forest">✓ Naitabi na ang payment channels!</span>
        ) : <div />}
        <button
          type="submit"
          className="rounded-xl bg-forest px-5 py-2.5 font-mono-brand text-xs font-bold text-white shadow-sm transition-all hover:bg-forest-deep active:scale-95"
        >
          I-save ang Payment Settings
        </button>
      </div>
    </form>
  );
}