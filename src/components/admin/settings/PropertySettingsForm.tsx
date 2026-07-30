// ==========================================
// PROPERTY SETTINGS FORM (components/admin/PropertySettingsForm.tsx)
// ==========================================
"use client";

import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { PropertySettings } from "@/src/types/admin/settings";
import {
  Building2,
  MapPin,
  Zap,
  Droplet,
  Percent,
  CalendarClock,
  ImageUp,
  ImageOff,
  X,
  RefreshCcw,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Landmark,
} from "lucide-react";

interface PropertySettingsProps {
  initialData: PropertySettings;
  onSave: (data: PropertySettings) => void;
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const ACCEPTED_EXT_LABEL = "PNG, JPG, JPEG, o WEBP";
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_COVER_DIMENSION = 1400;

export function PropertySettingsForm({ initialData, onSave }: PropertySettingsProps) {
  const [formData, setFormData] = useState<PropertySettings>(initialData);
  const [saved, setSaved] = useState(false);

  // ── Cover photo upload state ──
  const [coverPreview, setCoverPreview] = useState<string | null>(initialData.coverImage || null);
  const [coverError, setCoverError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingCover, setIsProcessingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  /** Secure intake: whitelist mime type, hard cap file size, then downscale/compress before storing. */
  const processCoverFile = (file: File) => {
    setCoverError("");

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setCoverError(`Larawan lang (${ACCEPTED_EXT_LABEL}) ang pwedeng i-upload.`);
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setCoverError("Lumampas sa 5MB ang file. Pumili ng mas maliit na larawan.");
      return;
    }

    setIsProcessingCover(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_COVER_DIMENSION) {
            height *= MAX_COVER_DIMENSION / width;
            width = MAX_COVER_DIMENSION;
          }
        } else {
          if (height > MAX_COVER_DIMENSION) {
            width *= MAX_COVER_DIMENSION / height;
            height = MAX_COVER_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
        setCoverPreview(compressedDataUrl);
        setFormData((prev) => ({ ...prev, coverImage: compressedDataUrl }));
        setIsProcessingCover(false);
      };
      img.onerror = () => {
        setCoverError("Hindi mabuksan ang larawan. Subukan ang ibang file.");
        setIsProcessingCover(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setCoverError("May problema sa pag-read ng file.");
      setIsProcessingCover(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processCoverFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processCoverFile(file);
  };

  const handleRemoveCover = () => {
    setCoverPreview(null);
    setCoverError("");
    setFormData((prev) => ({ ...prev, coverImage: "" }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7 rounded-3xl border border-line bg-paper-card p-5 sm:p-7 shadow-sm">
      <div>
        <h2 className="font-display text-lg font-bold text-forest-deep">
          Detalye ng Paupahan & Rates
        </h2>
        <p className="text-xs text-muted">
          I-set ang default late fee percentage, utility rates, pati na ang mga impormasyon para sa Hanap-Bahay listing.
        </p>
      </div>

      {/* ══════════════════════════════ */}
      {/* Cover Photo — optional, drag & drop */}
      {/* ══════════════════════════════ */}
      <section>
        <SectionHeader icon={ImageUp} title="Cover Photo" subtitle="Opsyonal — makikita ito sa Hanap-Bahay preview card ng property mo." />

        {coverPreview ? (
          <div className="relative overflow-hidden rounded-2xl border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverPreview}
              alt="Cover photo preview ng property"
              className="h-48 w-full object-cover sm:h-56"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                <Eye className="h-3 w-3" aria-hidden="true" />
                Preview
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-1.5 text-[11px] font-bold text-forest-deep transition-colors hover:bg-white"
                >
                  <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Palitan
                </button>
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-coral/90 px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-coral-deep"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Alisin
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
            }}
            aria-label="Mag-upload ng cover photo, i-click o i-drag ang larawan dito"
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${isDragging ? "border-forest bg-forest/5" : "border-line bg-paper hover:border-forest/50 hover:bg-forest/[0.03]"
              }`}
          >
            <div className="rounded-full bg-forest/10 p-3 text-forest">
              {isProcessingCover ? (
                <RefreshCcw className="h-6 w-6 animate-spin" aria-hidden="true" />
              ) : (
                <ImageUp className="h-6 w-6" aria-hidden="true" />
              )}
            </div>
            <span className="text-xs font-bold text-forest-deep">
              {isProcessingCover ? "Ini-process ang larawan..." : "I-drag ang larawan dito o mag-click para pumili"}
            </span>
            <span className="text-[11px] text-muted">
              {ACCEPTED_EXT_LABEL} · hanggang 5MB
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        )}

        {coverError && (
          <div className="mt-2 flex items-center gap-1.5 rounded-xl border border-coral/30 bg-coral/10 px-3 py-2 text-[11px] font-bold text-coral-deep">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{coverError}</span>
          </div>
        )}
      </section>

      {/* ══════════════════════════════ */}
      {/* Basic Info */}
      {/* ══════════════════════════════ */}
      <section>
        <SectionHeader icon={Building2} title="Impormasyon ng Property" subtitle="Pangalan at lokasyon na makikita sa listing." />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Pangalan ng Apartment / Business Name" span2>
            <input
              type="text"
              value={formData.propertyName}
              onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
              className={inputClass}
              required
            />
          </Field>

          <Field label="Street Address ng Paupahan" span2 icon={MapPin}>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={inputClass}
              required
            />
          </Field>

          <Field label="Lungsod / City">
            <input
              type="text"
              value={formData.city || ""}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Hal. Quezon City"
              className={inputClass}
              required
            />
          </Field>

          <Field label="Lalawigan / Province" icon={Landmark}>
            <input
              type="text"
              value={formData.province || ""}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              placeholder="Hal. Metro Manila"
              className={inputClass}
              required
            />
          </Field>

          <Field label="Postal Code">
            <input
              type="text"
              value={formData.postalCode || ""}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              placeholder="Hal. 1100"
              className={`${inputClass} font-mono-brand font-bold`}
            />
          </Field>
        </div>
      </section>

      {/* ══════════════════════════════ */}
      {/* Utility Rates */}
      {/* ══════════════════════════════ */}
      <section>
        <SectionHeader icon={Zap} title="Utility Rates" subtitle="Ginagamit sa auto-computation ng monthly billing." />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3.5">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <Zap className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold text-forest-deep">Kuryente</span>
            </div>
            <label className="block text-[11px] font-semibold text-muted mb-1">Rate (₱ / kWh)</label>
            <input
              type="number"
              step="0.01"
              value={formData.electricityRatePerKwh}
              onChange={(e) => setFormData({ ...formData, electricityRatePerKwh: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-amber-200 bg-white px-3.5 py-2.5 font-mono-brand text-xs font-bold text-ink outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-3.5">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Droplet className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
              <span className="text-xs font-bold text-forest-deep">Tubig</span>
            </div>
            <label className="block text-[11px] font-semibold text-muted mb-1">Rate (₱ / m³)</label>
            <input
              type="number"
              step="0.01"
              value={formData.waterRatePerCubic}
              onChange={(e) => setFormData({ ...formData, waterRatePerCubic: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 font-mono-brand text-xs font-bold text-ink outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ */}
      {/* Late Fee & Grace Period */}
      {/* ══════════════════════════════ */}
      <section>
        <SectionHeader icon={Percent} title="Late Fee Policy" subtitle="Kailan at magkano ang penalty sa huling bayad." />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Grace Period (Araw bago mag-late penalty)" icon={CalendarClock}>
            <input
              type="number"
              value={formData.defaultGracePeriodDays}
              onChange={(e) => setFormData({ ...formData, defaultGracePeriodDays: parseInt(e.target.value) || 0 })}
              className={`${inputClass} font-mono-brand font-bold`}
              required
            />
          </Field>

          <Field label="Late Fee Penalty (%)" icon={Percent}>
            <input
              type="number"
              step="0.1"
              value={formData.lateFeePercentage}
              onChange={(e) => setFormData({ ...formData, lateFeePercentage: parseFloat(e.target.value) || 0 })}
              className={`${inputClass} font-mono-brand font-bold`}
              required
            />
          </Field>
        </div>
      </section>

      {/* ══════════════════════════════ */}
      {/* Publish toggle */}
      {/* ══════════════════════════════ */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-paper p-4">
        <div>
          <span className="block text-xs font-bold text-forest-deep">I-publish sa Hanap-Bahay?</span>
          <span className="text-[11px] text-muted">Kapag naka-on, makikita ito ng publiko sa listahan ng mga paupahan.</span>
        </div>
        <label className="relative inline-flex shrink-0 cursor-pointer items-center">
          <input
            type="checkbox"
            checked={formData.isPublic ?? false}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-line after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest"></div>
        </label>
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
          I-save ang Settings
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs font-medium text-ink outline-none focus:border-forest focus:ring-2 focus:ring-forest/10 transition-colors";

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof ImageUp;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-marigold/12">
        <Icon className="h-4 w-4 text-marigold-deep" aria-hidden="true" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-forest-deep leading-tight">{title}</h3>
        <p className="text-[11px] text-muted leading-tight">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  span2,
  children,
}: {
  label: string;
  icon?: typeof MapPin;
  span2?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={span2 ? "sm:col-span-2" : undefined}>
      <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-forest-deep">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted" aria-hidden="true" />}
        {label}
      </label>
      {children}
    </div>
  );
}