"use client";

import { useMemo, useState, type FormEvent } from "react";
import { ProfileSettings } from "@/src/types/admin/settings";
import { User, Mail, Phone, CheckCircle2 } from "lucide-react";

interface ProfileSettingsProps {
  initialData: ProfileSettings;
  onSave: (data: ProfileSettings) => void;
}

const AVATAR_COLORS = [
  "bg-forest text-white",
  "bg-marigold text-forest-deep",
  "bg-coral text-white",
  "bg-blue-500 text-white",
];

export function ProfileSettingsForm({ initialData, onSave }: ProfileSettingsProps) {
  const [formData, setFormData] = useState<ProfileSettings>(initialData);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const initials = useMemo(() => {
    const trimmed = formData.fullName?.trim();
    if (!trimmed) return "?";
    const parts = trimmed.split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase();
  }, [formData.fullName]);

  const avatarColor = useMemo(() => {
    const seed = (formData.fullName || "landlord").length;
    return AVATAR_COLORS[seed % AVATAR_COLORS.length];
  }, [formData.fullName]);

  return (
    <form onSubmit={handleSubmit} className="space-y-7 rounded-3xl border border-line bg-paper-card p-5 sm:p-7 shadow-sm">
      {/* ── Header with live avatar preview ── */}
      <div className="flex items-center gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display text-lg font-extrabold shadow-sm transition-colors ${avatarColor}`}
          aria-hidden="true"
        >
          {initials}
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-forest-deep">
            Profile ng Landlord
          </h2>
          <p className="text-xs text-muted">
            I-update ang iyong personal na impormasyon at contact details.
          </p>
        </div>
      </div>

      {/* ── Fields ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Buong Pangalan" icon={User} span2>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Hal. Maria Santos"
            className={inputClass}
            required
          />
        </Field>

        <Field label="Email Address" icon={Mail}>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="ikaw@halimbawa.com"
            className={inputClass}
            required
          />
        </Field>

        <Field label="Numero ng Telepono / Mobile" icon={Phone}>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="09XX XXX XXXX"
            className={`${inputClass} font-mono-brand font-bold`}
            required
          />
        </Field>
      </div>

      {/* ── Trust note ── */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-line bg-paper p-3.5">
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
        <p className="text-[11px] leading-relaxed text-muted">
          Ginagamit lang ang email at numero mo para sa mga notification tungkol sa payment at maintenance requests ng mga tenant — hindi ito ipinapakita sa publiko.
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-line/60 pt-4">
        {saved ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-forest">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Naitabi na ang mga pagbabago!
          </span>
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

const inputClass =
  "w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs font-medium text-ink outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition-colors";

function Field({
  label,
  icon: Icon,
  span2,
  children,
}: {
  label: string;
  icon: typeof User;
  span2?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={span2 ? "sm:col-span-2" : undefined}>
      <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-forest-deep">
        <Icon className="h-3.5 w-3.5 text-muted" aria-hidden="true" />
        {label}
      </label>
      {children}
    </div>
  );
}