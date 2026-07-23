"use client";

import { useState } from "react";
import { NotificationSettings } from "@/src/types/admin/settings";

interface SecuritySettingsProps {
  initialData: NotificationSettings;
  onSave: (data: NotificationSettings) => void;
}

export function SecuritySettingsForm({ initialData, onSave }: SecuritySettingsProps) {
  const [formData, setFormData] = useState<NotificationSettings>(initialData);
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirmPass: "" });
  const [saved, setSaved] = useState(false);

  const handleSubmitNotifications = (e: React.SubmitEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChangePassword = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirmPass) {
      alert("Hindi magkatugma ang bagong password!");
      return;
    }
    alert("Matagumpay na pinalitan ang password!");
    setPasswords({ current: "", newPass: "", confirmPass: "" });
  };

  return (
    <div className="space-y-6">
      {/* Notifications Switcher */}
      <form onSubmit={handleSubmitNotifications} className="space-y-4 rounded-3xl border border-line bg-paper-card p-5 sm:p-7 shadow-sm">
        <h2 className="font-display text-lg font-bold text-forest-deep">
          Notifications & Auto Reminders
        </h2>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between rounded-2xl border border-line bg-paper p-3.5">
            <span>Awtomatikong SMS Reminder para sa Overdue Bills</span>
            <input
              type="checkbox"
              checked={formData.autoRemindOverdue}
              onChange={(e) => setFormData({ ...formData, autoRemindOverdue: e.target.checked })}
              className="accent-forest h-4 w-4"
            />
          </label>

          <label className="flex items-center justify-between rounded-2xl border border-line bg-paper p-3.5">
            <span>Email Alerts kapag may bagong Maintenance Ticket</span>
            <input
              type="checkbox"
              checked={formData.emailAlerts}
              onChange={(e) => setFormData({ ...formData, emailAlerts: e.target.checked })}
              className="accent-forest h-4 w-4"
            />
          </label>
        </div>

        <div className="flex items-center justify-between border-t border-line/60 pt-4">
          {saved ? <span className="text-xs font-bold text-forest">✓ Saved!</span> : <div />}
          <button
            type="submit"
            className="rounded-xl bg-forest px-5 py-2 font-mono-brand text-xs font-bold text-white hover:bg-forest-deep"
          >
            I-save ang Preference
          </button>
        </div>
      </form>

      {/* Password Change */}
      <form onSubmit={handleChangePassword} className="space-y-4 rounded-3xl border border-line bg-paper-card p-5 sm:p-7 shadow-sm">
        <h2 className="font-display text-lg font-bold text-forest-deep">
          Baguhin ang Password
        </h2>

        <div className="space-y-3">
          <input
            type="password"
            placeholder="Kasalukuyang Password"
            value={passwords.current}
            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs font-medium text-ink outline-none"
            required
          />
          <input
            type="password"
            placeholder="Bagong Password"
            value={passwords.newPass}
            onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs font-medium text-ink outline-none"
            required
          />
          <input
            type="password"
            placeholder="Kumpirmahin ang Bagong Password"
            value={passwords.confirmPass}
            onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs font-medium text-ink outline-none"
            required
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="rounded-xl bg-coral px-5 py-2 font-mono-brand text-xs font-bold text-white hover:bg-coral-deep"
          >
            I-update ang Password
          </button>
        </div>
      </form>
    </div>
  );
}