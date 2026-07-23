"use client";

import { useState } from "react";
import { PropertySettings } from "@/src/types/admin/settings";

interface PropertySettingsProps {
  initialData: PropertySettings;
  onSave: (data: PropertySettings) => void;
}

export function PropertySettingsForm({ initialData, onSave }: PropertySettingsProps) {
  const [formData, setFormData] = useState<PropertySettings>(initialData);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-line bg-paper-card p-5 sm:p-7 shadow-sm">
      <div>
        <h2 className="font-display text-lg font-bold text-forest-deep">
          Detatye ng Paupahan & Rates
        </h2>
        <p className="text-xs text-muted">
          I-set ang default late fee percentage at kuryente/tubig rate per unit.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-forest-deep mb-1">
            Pangalan ng Apartment / Business Name
          </label>
          <input
            type="text"
            value={formData.propertyName}
            onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs font-medium text-ink outline-none focus:border-forest"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-forest-deep mb-1">
            Address ng Paupahan
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs font-medium text-ink outline-none focus:border-forest"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-forest-deep mb-1">
            Rate ng Kuryente (₱ / kWh)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.electricityRatePerKwh}
            onChange={(e) => setFormData({ ...formData, electricityRatePerKwh: parseFloat(e.target.value) || 0 })}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono-brand text-xs font-bold text-ink outline-none focus:border-forest"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-forest-deep mb-1">
            Rate ng Tubig (₱ / m³)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.waterRatePerCubic}
            onChange={(e) => setFormData({ ...formData, waterRatePerCubic: parseFloat(e.target.value) || 0 })}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono-brand text-xs font-bold text-ink outline-none focus:border-forest"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-forest-deep mb-1">
            Grace Period (Araw bago mag-late penalty)
          </label>
          <input
            type="number"
            value={formData.defaultGracePeriodDays}
            onChange={(e) => setFormData({ ...formData, defaultGracePeriodDays: parseInt(e.target.value) || 0 })}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono-brand text-xs font-bold text-ink outline-none focus:border-forest"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-forest-deep mb-1">
            Late Fee Penalty (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.lateFeePercentage}
            onChange={(e) => setFormData({ ...formData, lateFeePercentage: parseFloat(e.target.value) || 0 })}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 font-mono-brand text-xs font-bold text-ink outline-none focus:border-forest"
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line/60 pt-4">
        {saved ? (
          <span className="text-xs font-bold text-forest">✓ Naitabi na ang rates!</span>
        ) : <div />}
        <button
          type="submit"
          className="rounded-xl bg-forest px-5 py-2.5 font-mono-brand text-xs font-bold text-white shadow-sm transition-all hover:bg-forest-deep active:scale-95"
        >
          I-save ang Rates
        </button>
      </div>
    </form>
  );
}