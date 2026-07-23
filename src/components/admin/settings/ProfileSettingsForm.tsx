"use client";

import { useState } from "react";
import { ProfileSettings } from "@/src/types/admin/settings";

interface ProfileSettingsProps {
  initialData: ProfileSettings;
  onSave: (data: ProfileSettings) => void;
}

export function ProfileSettingsForm({ initialData, onSave }: ProfileSettingsProps) {
  const [formData, setFormData] = useState<ProfileSettings>(initialData);
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
          Profile ng Landlord
        </h2>
        <p className="text-xs text-muted">
          I-update ang iyong personal na impormasyon at contact details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold text-forest-deep mb-1">
            Buong Pangalan
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs font-medium text-ink outline-none focus:border-forest"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-forest-deep mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs font-medium text-ink outline-none focus:border-forest"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-forest-deep mb-1">
            Numero ng Telepono / Mobile
          </label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs font-medium text-ink outline-none focus:border-forest"
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line/60 pt-4">
        {saved ? (
          <span className="text-xs font-bold text-forest">✓ Naitabi na ang mga pagbabago!</span>
        ) : <div />}
        <button
          type="submit"
          className="rounded-xl bg-forest px-5 py-2.5 font-mono-brand text-xs font-bold text-white shadow-sm transition-all hover:bg-forest-deep active:scale-95"
        >
          I-save ang Profile
        </button>
      </div>
    </form>
  );
}