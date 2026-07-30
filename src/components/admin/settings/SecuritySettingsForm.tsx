"use client";

import { useMemo, useState, type FormEvent } from "react";
import { NotificationSettings } from "@/src/types/admin/settings";
import {
  MessageSquareWarning,
  Mail,
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface SecuritySettingsProps {
  initialData: NotificationSettings;
  onSave: (data: NotificationSettings) => void;
}

export function SecuritySettingsForm({ initialData, onSave }: SecuritySettingsProps) {
  const [formData, setFormData] = useState<NotificationSettings>(initialData);
  const [saved, setSaved] = useState(false);

  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirmPass: "" });
  const [showPass, setShowPass] = useState({ current: false, newPass: false, confirmPass: false });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSubmitNotifications = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const strength = useMemo(() => passwordStrength(passwords.newPass), [passwords.newPass]);

  const confirmMatches = passwords.confirmPass.length > 0 && passwords.confirmPass === passwords.newPass;
  const confirmMismatch = passwords.confirmPass.length > 0 && passwords.confirmPass !== passwords.newPass;

  const handleChangePassword = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (passwords.newPass.length < 8) {
      setPasswordError("Kailangan ng hindi bababa sa 8 characters ang bagong password.");
      return;
    }
    if (passwords.newPass !== passwords.confirmPass) {
      setPasswordError("Hindi magkatugma ang bagong password at kumpirmasyon.");
      return;
    }
    if (passwords.newPass === passwords.current) {
      setPasswordError("Dapat kaiba ang bagong password sa kasalukuyan mong password.");
      return;
    }

    setPasswordSuccess(true);
    setPasswords({ current: "", newPass: "", confirmPass: "" });
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* ══════════════════════════════ */}
      {/* Notifications */}
      {/* ══════════════════════════════ */}
      <form onSubmit={handleSubmitNotifications} className="space-y-4 rounded-3xl border border-line bg-paper-card p-5 sm:p-7 shadow-sm">
        <SectionHeader
          icon={MessageSquareWarning}
          title="Notifications & Auto Reminders"
          subtitle="Piliin kung paano ka babalaan tungkol sa bills at tickets."
        />

        <div className="space-y-3">
          <ToggleRow
            icon={MessageSquareWarning}
            accent="marigold"
            label="Awtomatikong SMS Reminder"
            description="Para sa Overdue Bills ng mga tenant."
            checked={formData.autoRemindOverdue}
            onChange={(checked) => setFormData({ ...formData, autoRemindOverdue: checked })}
          />

          <ToggleRow
            icon={Mail}
            accent="blue"
            label="Email Alerts"
            description="Kapag may bagong Maintenance Ticket na na-file."
            checked={formData.emailAlerts}
            onChange={(checked) => setFormData({ ...formData, emailAlerts: checked })}
          />
        </div>

        <div className="flex items-center justify-between border-t border-line/60 pt-4">
          {saved ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-forest">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Naitabi na!
            </span>
          ) : <div />}
          <button
            type="submit"
            className="rounded-xl bg-forest px-5 py-2.5 font-mono-brand text-xs font-bold text-white shadow-sm transition-all hover:bg-forest-deep active:scale-95"
          >
            I-save ang Preference
          </button>
        </div>
      </form>

      {/* ══════════════════════════════ */}
      {/* Password Change */}
      {/* ══════════════════════════════ */}
      <form onSubmit={handleChangePassword} className="space-y-4 rounded-3xl border border-line bg-paper-card p-5 sm:p-7 shadow-sm">
        <SectionHeader
          icon={KeyRound}
          title="Baguhin ang Password"
          subtitle="Gumamit ng malakas na password na hindi mo pa nagagamit dati."
        />

        <div className="space-y-3">
          <PasswordField
            placeholder="Kasalukuyang Password"
            value={passwords.current}
            onChange={(v) => setPasswords({ ...passwords, current: v })}
            visible={showPass.current}
            onToggleVisible={() => setShowPass({ ...showPass, current: !showPass.current })}
          />

          <div>
            <PasswordField
              placeholder="Bagong Password"
              value={passwords.newPass}
              onChange={(v) => setPasswords({ ...passwords, newPass: v })}
              visible={showPass.newPass}
              onToggleVisible={() => setShowPass({ ...showPass, newPass: !showPass.newPass })}
            />
            {passwords.newPass.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex h-1.5 flex-1 gap-1 overflow-hidden rounded-full bg-line">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-full flex-1 rounded-full transition-colors ${i < strength.score ? strength.barColor : "bg-transparent"
                        }`}
                    />
                  ))}
                </div>
                <span className={`text-[10px] font-bold ${strength.textColor}`}>{strength.label}</span>
              </div>
            )}
          </div>

          <div>
            <PasswordField
              placeholder="Kumpirmahin ang Bagong Password"
              value={passwords.confirmPass}
              onChange={(v) => setPasswords({ ...passwords, confirmPass: v })}
              visible={showPass.confirmPass}
              onToggleVisible={() => setShowPass({ ...showPass, confirmPass: !showPass.confirmPass })}
              trailingIcon={
                confirmMatches ? (
                  <CheckCircle2 className="h-4 w-4 text-forest" aria-hidden="true" />
                ) : confirmMismatch ? (
                  <XCircle className="h-4 w-4 text-coral" aria-hidden="true" />
                ) : null
              }
            />
          </div>
        </div>

        {passwordError && (
          <div className="flex items-center gap-1.5 rounded-xl border border-coral/30 bg-coral/10 px-3.5 py-2.5 text-[11px] font-bold text-coral-deep">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSuccess && (
          <div className="flex items-center gap-1.5 rounded-xl border border-forest/30 bg-forest/10 px-3.5 py-2.5 text-[11px] font-bold text-forest">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Matagumpay na pinalitan ang password!</span>
          </div>
        )}

        <div className="flex items-start gap-2.5 rounded-2xl border border-line bg-paper p-3.5">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          </div>
          <p className="text-[11px] leading-relaxed text-muted">
            Gamitin ang kombinasyon ng malaki/maliit na letra, numero, at simbolo. Iwasan ang password na ginagamit mo rin sa ibang site.
          </p>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="rounded-xl bg-coral px-5 py-2.5 font-mono-brand text-xs font-bold text-white shadow-sm transition-all hover:bg-coral-deep active:scale-95"
          >
            I-update ang Password
          </button>
        </div>
      </form>
    </div>
  );
}

function passwordStrength(pw: string): { score: number; label: string; barColor: string; textColor: string } {
  if (!pw) return { score: 0, label: "", barColor: "bg-line", textColor: "text-muted" };

  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = [
    { label: "Mahina", barColor: "bg-coral", textColor: "text-coral-deep" },
    { label: "Mahina", barColor: "bg-coral", textColor: "text-coral-deep" },
    { label: "Katamtaman", barColor: "bg-marigold", textColor: "text-marigold-deep" },
    { label: "Malakas", barColor: "bg-forest", textColor: "text-forest" },
    { label: "Napaka-lakas", barColor: "bg-forest", textColor: "text-forest" },
  ];

  return { score, ...levels[score] };
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof ShieldCheck;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-marigold/12">
        <Icon className="h-4 w-4 text-marigold-deep" aria-hidden="true" />
      </div>
      <div>
        <h2 className="font-display text-sm font-bold text-forest-deep leading-tight sm:text-base">{title}</h2>
        <p className="text-[11px] text-muted leading-tight">{subtitle}</p>
      </div>
    </div>
  );
}

const TOGGLE_ACCENTS = {
  marigold: "bg-marigold/12 text-marigold-deep",
  blue: "bg-blue-100 text-blue-600",
} as const;

function ToggleRow({
  icon: Icon,
  accent,
  label,
  description,
  checked,
  onChange,
}: {
  icon: typeof Mail;
  accent: keyof typeof TOGGLE_ACCENTS;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-paper p-3.5 cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${TOGGLE_ACCENTS[accent]}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <span className="block text-xs font-bold text-forest-deep">{label}</span>
          <span className="text-[11px] text-muted">{description}</span>
        </div>
      </div>
      <span className="relative inline-flex shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-line after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest"></div>
      </span>
    </label>
  );
}

function PasswordField({
  placeholder,
  value,
  onChange,
  visible,
  onToggleVisible,
  trailingIcon,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  trailingIcon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3.5 py-2.5 transition-colors focus-within:border-forest focus-within:ring-2 focus-within:ring-forest/10">
      <Lock className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
      <input
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-0 bg-transparent text-xs font-medium text-ink outline-none placeholder:text-muted/70"
        required
      />
      {trailingIcon}
      <button
        type="button"
        onClick={onToggleVisible}
        className="shrink-0 text-muted hover:text-forest-deep"
        aria-label={visible ? "Itago ang password" : "Ipakita ang password"}
      >
        {visible ? <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> : <Eye className="h-3.5 w-3.5" aria-hidden="true" />}
      </button>
    </div>
  );
}