/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, ChangeEvent } from "react";
import { PaymentGatewaySettings } from "@/src/types/admin/settings";
import Image from 'next/image';
import {
  Smartphone,
  Wallet,
  Landmark,
  User,
  Hash,
  CheckCircle2,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";

interface PaymentSettingsProps {
  initialData: PaymentGatewaySettings;
  onSave: (data: PaymentGatewaySettings) => void;
}

export function PaymentSettingsForm({ initialData, onSave }: PaymentSettingsProps) {
  const [formData, setFormData] = useState<PaymentGatewaySettings>(initialData);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const activeCount = [
    formData.isGcashActive,
    formData.isMayaActive,
    formData.isBankActive,
  ].filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-line bg-paper-card p-5 sm:p-7 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-forest-deep">
            Paraan ng Pagtanggap ng Bayad
          </h2>
          <p className="text-xs text-muted">
            Ito ang mga detalye at QR codes ng GCash, Maya, o Bank Account na makikita ng tenants sa kanilang bill.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-forest/10 px-3 py-1 text-[11px] font-bold text-forest">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          {activeCount} aktibong channel
        </span>
      </div>

      {/* GCash Channel */}
      <PaymentChannelCard
        icon={Smartphone}
        accent="blue"
        title="GCash Payment"
        active={formData.isGcashActive}
        onToggle={(checked) => setFormData({ ...formData, isGcashActive: checked })}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ChannelInput
              icon={Smartphone}
              placeholder="GCash Number (e.g. 09171234567)"
              value={formData.gcashNumber || ""}
              onChange={(v) => setFormData({ ...formData, gcashNumber: v })}
            />
            <ChannelInput
              icon={User}
              placeholder="Account Name (e.g. Juan D.)"
              value={formData.gcashName || ""}
              onChange={(v) => setFormData({ ...formData, gcashName: v })}
            />
          </div>
          {/* QR Code Uploader para sa GCash (Base64 Enforced) */}
          <QRCodeUploader
            label="GCash QR Code"
            imageUrl={(formData as any).gcashQrUrl}
            onImageChange={(base64Url) => setFormData({ ...formData, gcashQrUrl: base64Url } as any)}
          />
        </div>
      </PaymentChannelCard>

      {/* Maya Channel */}
      <PaymentChannelCard
        icon={Wallet}
        accent="emerald"
        title="Maya Payment"
        active={formData.isMayaActive}
        onToggle={(checked) => setFormData({ ...formData, isMayaActive: checked })}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ChannelInput
              icon={Smartphone}
              placeholder="Maya Number"
              value={formData.mayaNumber || ""}
              onChange={(v) => setFormData({ ...formData, mayaNumber: v })}
            />
            <ChannelInput
              icon={User}
              placeholder="Account Name"
              value={formData.mayaName || ""}
              onChange={(v) => setFormData({ ...formData, mayaName: v })}
            />
          </div>
          {/* QR Code Uploader para sa Maya (Base64 Enforced) */}
          <QRCodeUploader
            label="Maya QR Code"
            imageUrl={(formData as any).mayaQrUrl}
            onImageChange={(base64Url) => setFormData({ ...formData, mayaQrUrl: base64Url } as any)}
          />
        </div>
      </PaymentChannelCard>

      {/* Bank Transfer Channel */}
      <PaymentChannelCard
        icon={Landmark}
        accent="forest"
        title="Bank Transfer"
        active={formData.isBankActive}
        onToggle={(checked) => setFormData({ ...formData, isBankActive: checked })}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ChannelInput
            icon={Landmark}
            placeholder="Bank Name (BDO, BPI, etc.)"
            value={formData.bankName || ""}
            onChange={(v) => setFormData({ ...formData, bankName: v })}
          />
          <ChannelInput
            icon={Hash}
            placeholder="Account Number"
            value={formData.bankAccountNo || ""}
            onChange={(v) => setFormData({ ...formData, bankAccountNo: v })}
            mono
          />
          <ChannelInput
            icon={User}
            placeholder="Account Name"
            value={formData.bankAccountName || ""}
            onChange={(v) => setFormData({ ...formData, bankAccountName: v })}
          />
        </div>
      </PaymentChannelCard>

      {activeCount === 0 && (
        <p className="rounded-xl border border-marigold/30 bg-marigold/10 px-3.5 py-2.5 text-[11px] font-semibold text-marigold-deep">
          Wala pang aktibong payment channel — i-on ang hindi bababa sa isa para makapag-bayad online ang mga tenant mo.
        </p>
      )}

      <div className="flex items-center justify-between border-t border-line/60 pt-4">
        {saved ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-forest animate-in fade-in">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Naitabi na ang payment channels!
          </span>
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

const ACCENT_STYLES = {
  blue: {
    iconWrap: "bg-blue-100 text-blue-600",
    text: "text-blue-600",
    border: "border-blue-200",
    activeBorder: "border-blue-300/80 bg-blue-50/20",
  },
  emerald: {
    iconWrap: "bg-emerald-100 text-emerald-600",
    text: "text-emerald-600",
    border: "border-emerald-200",
    activeBorder: "border-emerald-300/80 bg-emerald-50/20",
  },
  forest: {
    iconWrap: "bg-forest/10 text-forest",
    text: "text-forest-deep",
    border: "border-line",
    activeBorder: "border-forest/30 bg-forest/[0.02]",
  },
} as const;

function PaymentChannelCard({
  icon: Icon,
  accent,
  title,
  active,
  onToggle,
  children,
}: {
  icon: typeof Smartphone;
  accent: keyof typeof ACCENT_STYLES;
  title: string;
  active: boolean;
  onToggle: (checked: boolean) => void;
  children: React.ReactNode;
}) {
  const styles = ACCENT_STYLES[accent];

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        active ? styles.activeBorder : "border-line/80 bg-paper"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${styles.iconWrap}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <span className={`font-display text-xs font-bold ${styles.text}`}>{title}</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-forest" : "bg-muted/50"}`} aria-hidden="true" />
              <span className="text-[10px] font-semibold text-muted">
                {active ? "Aktibo" : "Naka-off"}
              </span>
            </div>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-line after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest"></div>
        </label>
      </div>

      {active && (
        <div className="mt-4 pt-3 border-t border-line/50 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

function ChannelInput({
  icon: Icon,
  placeholder,
  value,
  onChange,
  mono,
}: {
  icon: typeof Smartphone;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-paper-card px-3 py-2 transition-colors focus-within:border-forest focus-within:ring-2 focus-within:ring-forest/10">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full min-w-0 bg-transparent text-xs font-medium text-ink outline-none placeholder:text-muted/70 ${
          mono ? "font-mono-brand" : ""
        }`}
      />
    </div>
  );
}

function QRCodeUploader({
  label,
  imageUrl,
  onImageChange,
}: {
  label: string;
  imageUrl?: string;
  onImageChange: (url?: string) => void;
}) {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 🛠️ I-convert ang in-upload na file patungong Base64 string para maging permanente sa database
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onImageChange(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-dashed border-line bg-paper/50 p-3.5">
      {imageUrl ? (
        <div className="relative group shrink-0">
          <div className="h-20 w-20 overflow-hidden rounded-lg border border-line bg-white p-1 flex items-center justify-center relative">
            <Image 
              src={imageUrl} 
              alt={label} 
              fill 
              sizes="80px"
              className="object-contain rounded" 
            />
          </div>
          <button
            type="button"
            onClick={() => onImageChange(undefined)}
            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition-colors"
            title="Alisin ang QR Code"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-line bg-paper text-muted">
          <ImageIcon className="h-6 w-6 opacity-40" />
        </div>
      )}

      <div className="flex-1 space-y-1">
        <span className="text-xs font-bold text-ink">{label}</span>
        <p className="text-[11px] text-muted">
          Mag-upload ng malinaw na QR code image (PNG, JPG) para madaling ma-scan ng iyong mga tenant.
        </p>
        <div className="pt-1">
          <label className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-1.5 text-[11px] font-semibold text-ink shadow-sm cursor-pointer hover:bg-paper-card transition-all active:scale-95">
            <Upload className="h-3.5 w-3.5 text-forest" />
            <span>{imageUrl ? "Palitan ang QR Code" : "Mag-upload ng QR Code"}</span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}