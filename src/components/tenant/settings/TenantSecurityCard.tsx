"use client";

import { useState } from "react";

export function TenantSecurityCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Hindi magkatugma ang bagong password at confirmation!");
      return;
    }
    alert("Matagumpay na nabago ang password!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <form onSubmit={handlePasswordChange} className="rounded-3xl border border-line bg-paper-card p-5 sm:p-6 shadow-sm space-y-4">
      <div className="border-b border-line pb-3">
        <h2 className="font-display text-base font-bold text-forest-deep sm:text-lg">
          Seguridad at Password
        </h2>
        <p className="text-[11px] text-muted">Palitan ang iyong password regular para sa kaligtasan ng account.</p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="font-mono-brand text-[11px] font-bold uppercase text-forest-deep">Kasalukuyang Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-2xl border border-line bg-paper px-4 py-2.5 text-xs font-medium text-forest-deep focus:border-forest focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="font-mono-brand text-[11px] font-bold uppercase text-forest-deep">Bagong Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-2xl border border-line bg-paper px-4 py-2.5 text-xs font-medium text-forest-deep focus:border-forest focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono-brand text-[11px] font-bold uppercase text-forest-deep">Kumpirmahin ang Bagong Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-2xl border border-line bg-paper px-4 py-2.5 text-xs font-medium text-forest-deep focus:border-forest focus:outline-none"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="rounded-full border border-forest/30 bg-forest/5 px-6 py-2.5 font-mono-brand text-xs font-bold text-forest hover:bg-forest hover:text-white transition-all active:scale-95"
        >
          Baguhin ang Password
        </button>
      </div>
    </form>
  );
}