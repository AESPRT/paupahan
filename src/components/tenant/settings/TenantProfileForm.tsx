"use client";

import { TenantSettingsData } from "@/src/types/tenant/tenant-settings";
import { useState } from "react";

interface TenantProfileFormProps {
  initialData: TenantSettingsData;
}

export function TenantProfileForm({ initialData }: TenantProfileFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Matagumpay na nai-save ang iyong profile!");
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-line bg-paper-card p-5 sm:p-6 shadow-sm space-y-5">
      <div className="border-b border-line pb-3">
        <h2 className="font-display text-base font-bold text-forest-deep sm:text-lg">
          Personal na Impormasyon
        </h2>
        <p className="text-[11px] text-muted">Maaari mong baguhin ang iyong pangalan, email, o numero kung kinakailangan.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="font-mono-brand text-[11px] font-bold uppercase text-forest-deep">Buong Pangalan</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full rounded-2xl border border-line bg-paper px-4 py-2.5 text-xs font-medium text-forest-deep focus:border-forest focus:outline-none"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-mono-brand text-[11px] font-bold uppercase text-forest-deep">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full rounded-2xl border border-line bg-paper px-4 py-2.5 text-xs font-medium text-forest-deep focus:border-forest focus:outline-none"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-mono-brand text-[11px] font-bold uppercase text-forest-deep">Numero ng Telepono</label>
          <input
            type="text"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="w-full rounded-2xl border border-line bg-paper px-4 py-2.5 text-xs font-medium text-forest-deep focus:border-forest focus:outline-none"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-mono-brand text-[11px] font-bold uppercase text-forest-deep">Tinutuluyang Kwarto / Unit</label>
          <input
            type="text"
            value={`${formData.propertyName} - ${formData.roomName}`}
            disabled
            className="w-full rounded-2xl border border-line bg-paper/50 px-4 py-2.5 text-xs font-medium text-muted cursor-not-allowed"
          />
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div className="border-t border-line pt-4 space-y-4">
        <h3 className="font-display text-sm font-bold text-forest-deep">
          Emergency Contact (Sakaling May Emergency)
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="font-mono-brand text-[11px] font-bold uppercase text-forest-deep">Pangalan ng Contact Person</label>
            <input
              type="text"
              value={formData.emergencyContactName}
              onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
              className="w-full rounded-2xl border border-line bg-paper px-4 py-2.5 text-xs font-medium text-forest-deep focus:border-forest focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono-brand text-[11px] font-bold uppercase text-forest-deep">Numero ng Contact Person</label>
            <input
              type="text"
              value={formData.emergencyContactPhone}
              onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
              className="w-full rounded-2xl border border-line bg-paper px-4 py-2.5 text-xs font-medium text-forest-deep focus:border-forest focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-forest px-6 py-2.5 font-mono-brand text-xs font-bold text-white shadow-sm transition-all hover:bg-forest-deep active:scale-95 disabled:opacity-50"
        >
          {isSaving ? "Nai-save..." : "I-save ang Pagbabago"}
        </button>
      </div>
    </form>
  );
}