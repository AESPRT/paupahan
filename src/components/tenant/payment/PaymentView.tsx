/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, ChangeEvent } from "react";
import { submitPaymentAction } from "@/src/actions/tenant/tenant-actions";
import { 
  QrCode, 
  Upload, 
  X, 
  CheckCircle2, 
  Smartphone, 
  Landmark, 
  Wallet,
  ArrowRight
} from "lucide-react";

interface PaymentViewProps {
  billId: string;
  tenantId: string;
  monthYear: string;
  totalAmount: number;
  dueDate: string;
  landlordPaymentSettings?: any;
}

export function PaymentView({ 
  billId, 
  tenantId, 
  monthYear, 
  totalAmount, 
  dueDate,
  landlordPaymentSettings 
}: PaymentViewProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [receiptPreview, setReceiptPreview] = useState<string | undefined>(undefined);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  let settings: any = {};
  try {
    if (typeof landlordPaymentSettings === "string") {
      settings = JSON.parse(landlordPaymentSettings);
    } else {
      settings = landlordPaymentSettings || {};
    }
  } catch (e) {
    console.error("Error parsing payment settings:", e);
    settings = {};
  }

  // 🛠️ Mas pinalakas na pagsusuri (sumasalo ng boolean, string "true", o 1)
  const checkIsActive = (val: any) => {
    if (val === true || val === "true" || val === 1 || val === "1") return true;
    return false;
  };

  const isGcashActive = checkIsActive(settings.isGcashActive ?? settings.is_gcash_active);
  const isMayaActive = checkIsActive(settings.isMayaActive ?? settings.is_maya_active);
  const isBankActive = checkIsActive(settings.isBankActive ?? settings.is_bank_active);

  const gcashName = settings.gcashName || settings.gcash_name || "";
  const gcashNumber = settings.gcashNumber || settings.gcash_number || "";
  const gcashQrUrl = settings.gcashQrUrl || settings.gcash_qr_url || "";

  const mayaName = settings.mayaName || settings.maya_name || "";
  const mayaNumber = settings.mayaNumber || settings.maya_number || "";
  const mayaQrUrl = settings.mayaQrUrl || settings.maya_qr_url || "";

  // Dynamic list ng mga available payment methods
  const availableMethods = [
    { id: "cash", label: "Cash", sub: "Direkta sa Opisina", icon: Wallet, color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
    ...(isGcashActive ? [{ id: "gcash", label: "GCash", sub: "Online Transfer", icon: Smartphone, color: "bg-blue-500/10 text-blue-600 border-blue-200" }] : []),
    ...(isMayaActive ? [{ id: "maya", label: "Maya", sub: "Online Transfer", icon: Smartphone, color: "bg-green-500/10 text-green-600 border-green-200" }] : []),
    ...(isBankActive ? [{ id: "bank", label: "Bank Transfer", sub: "InstaPay / PESONet", icon: Landmark, color: "bg-indigo-500/10 text-indigo-600 border-indigo-200" }] : []),
  ];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      
      // 🛠️ I-convert ang in-upload na resibo patungong Base64 string
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setReceiptPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("billId", billId);
      formData.append("tenantId", tenantId);
      formData.append("paymentMethod", selectedMethod);
      formData.append("amount", totalAmount.toString());
      formData.append("referenceNo", referenceNumber);
      if (receiptFile) {
        formData.append("receipt", receiptFile);
      }

      const result = await submitPaymentAction(formData);

      if (result.success) {
        alert(result.message);
        window.location.href = "/tenant/dashboard/home";
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Nagkaroon ng problema sa pagproseso ng iyong bayad.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-16">
      {/* Page Header */}
      <div className="space-y-1">
        <span className="font-mono-brand text-[11px] uppercase tracking-wider text-muted font-bold">
          Bill Reference: {billId}
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-forest-deep">
          Magbayad para sa {monthYear}
        </h1>
        <p className="text-xs sm:text-sm text-muted">
          Piliin ang iyong paraan ng pagbabayad at isumite ang patunay ng transaksyon.
        </p>
      </div>

      {/* Summary Card */}
      <div className="rounded-3xl border border-line bg-paper-card p-5 sm:p-6 shadow-xs space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-forest/5 pointer-events-none" />
        <div className="flex items-center justify-between border-b border-line/60 pb-4">
          <span className="text-xs sm:text-sm font-bold text-muted">Kabuuang Babayaran</span>
          <span className="font-display text-2xl sm:text-3xl font-black text-forest-deep">
            ₱{totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Petsa ng Deadline (Due Date):</span>
          <span className="font-bold text-forest-deep bg-paper px-2.5 py-1 rounded-lg border border-line/60">{dueDate}</span>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handlePaymentSubmit} className="space-y-6">
        {/* Dynamic Selection Options */}
        <div className="space-y-3">
          <label className="font-display text-xs font-bold uppercase tracking-wider text-muted">
            Piliin ang Paraan ng Pagbabayad
          </label>
          <div className={`grid gap-3 sm:gap-4 ${
            availableMethods.length === 1 ? "grid-cols-1" : 
            availableMethods.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"
          }`}>
            {availableMethods.map((method) => {
              const IconComponent = method.icon;
              const isSelected = selectedMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex flex-col items-center justify-center gap-2.5 rounded-2xl border p-4 text-center transition-all ${
                    isSelected
                      ? "border-forest bg-forest/[0.04] text-forest-deep shadow-xs ring-2 ring-forest/20"
                      : "border-line bg-paper-card text-muted hover:bg-paper"
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${method.color}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-forest-deep">{method.label}</p>
                    <p className="text-[10px] text-muted">{method.sub}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conditional Details based on Selected Method */}
        {selectedMethod === "cash" && (
          <div className="rounded-3xl border border-line bg-paper-card p-5 sm:p-6 space-y-4 animate-in fade-in duration-200 shadow-xs">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
              Mga Tagubilin sa Cash Payment
            </h3>
            <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-xs text-amber-900 space-y-1">
              <p className="font-bold">Paalala:</p>
              <p className="leading-relaxed">
                Dalhin ang eksaktong halaga ng cash sa opisina o iabot ito nang direkta sa iyong landlord. Kapag nakumpirma na nila, awtomatikong magiging &quot;Paid&quot; ang bill na ito.
              </p>
            </div>
          </div>
        )}

        {selectedMethod === "gcash" && (
          <div className="rounded-3xl border border-line bg-paper-card p-5 sm:p-6 space-y-5 animate-in fade-in duration-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
                GCash Payment Details
              </h3>
              <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-600">
                GCash Online
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="space-y-3 bg-paper p-4 rounded-2xl border border-line/60">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted">Account Name</span>
                  <p className="font-display text-sm font-bold text-forest-deep">{gcashName || "Hindi pa na-setup"}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted">GCash Number</span>
                  <p className="font-mono-brand text-sm font-bold text-forest-deep">{gcashNumber || "Wala pang numero"}</p>
                </div>
              </div>

              {/* QR Code Display kung meron */}
              {gcashQrUrl ? (
                <div className="flex flex-col items-center justify-center p-3 bg-paper rounded-2xl border border-line/60">
                  <span className="text-[10px] font-bold text-muted mb-2">I-scan ang GCash QR</span>
                  <div className="h-28 w-28 overflow-hidden rounded-xl border border-line bg-white p-1 shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={gcashQrUrl} alt="GCash QR Code" className="h-full w-full object-contain rounded" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 bg-paper/50 rounded-2xl border border-dashed border-line text-center text-muted text-xs">
                  <QrCode className="h-8 w-8 opacity-40 mb-1" />
                  <span>Walang in-upload na QR Code ang Landlord. Gamitin ang numero sa kaliwa.</span>
                </div>
              )}
            </div>

            {/* Reference Number */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-forest-deep">GCash Reference Number (Ref No.)</label>
              <input
                type="text"
                required
                placeholder="Hal. 1029384756"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full rounded-2xl border border-line bg-paper px-4 py-3 font-mono-brand text-xs sm:text-sm text-forest-deep outline-none focus:border-forest transition-all"
              />
            </div>

            {/* Receipt Upload with Preview */}
            <ReceiptUploader 
              receiptPreview={receiptPreview}
              onFileChange={handleFileChange}
              onClear={() => { setReceiptFile(null); setReceiptPreview(undefined); }}
            />
          </div>
        )}

        {selectedMethod === "maya" && (
          <div className="rounded-3xl border border-line bg-paper-card p-5 sm:p-6 space-y-5 animate-in fade-in duration-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted">
                Maya Payment Details
              </h3>
              <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-[10px] font-bold text-green-600">
                Maya Online
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="space-y-3 bg-paper p-4 rounded-2xl border border-line/60">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted">Account Name</span>
                  <p className="font-display text-sm font-bold text-forest-deep">{mayaName || "Hindi pa na-setup"}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted">Maya Number</span>
                  <p className="font-mono-brand text-sm font-bold text-forest-deep">{mayaNumber || "Wala pang numero"}</p>
                </div>
              </div>

              {/* QR Code Display kung meron */}
              {mayaQrUrl ? (
                <div className="flex flex-col items-center justify-center p-3 bg-paper rounded-2xl border border-line/60">
                  <span className="text-[10px] font-bold text-muted mb-2">I-scan ang Maya QR</span>
                  <div className="h-28 w-28 overflow-hidden rounded-xl border border-line bg-white p-1 shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mayaQrUrl} alt="Maya QR Code" className="h-full w-full object-contain rounded" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 bg-paper/50 rounded-2xl border border-dashed border-line text-center text-muted text-xs">
                  <QrCode className="h-8 w-8 opacity-40 mb-1" />
                  <span>Walang in-upload na QR Code ang Landlord. Gamitin ang numero sa kaliwa.</span>
                </div>
              )}
            </div>

            {/* Reference Number */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-forest-deep">Maya Reference Number (Ref No.)</label>
              <input
                type="text"
                required
                placeholder="Hal. 1029384756"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full rounded-2xl border border-line bg-paper px-4 py-3 font-mono-brand text-xs sm:text-sm text-forest-deep outline-none focus:border-forest transition-all"
              />
            </div>

            {/* Receipt Upload with Preview */}
            <ReceiptUploader 
              receiptPreview={receiptPreview}
              onFileChange={handleFileChange}
              onClear={() => { setReceiptFile(null); setReceiptPreview(undefined); }}
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-forest py-4 font-mono-brand text-xs sm:text-sm font-bold text-white shadow-md hover:bg-forest-deep transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span>Pinoproseso ang Bayad...</span>
          ) : (
            <>
              <span>Isumite ang Bayad (Submit Payment)</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function ReceiptUploader({
  receiptPreview,
  onFileChange,
  onClear,
}: {
  receiptPreview?: string;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-1.5 pt-2">
      <label className="text-xs font-bold text-forest-deep">Patunay ng Pagbabayad (Screenshot)</label>
      
      {receiptPreview ? (
        <div className="relative flex items-center gap-3 rounded-2xl border border-forest/30 bg-forest/[0.02] p-3">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-line bg-white p-1 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={receiptPreview} alt="Receipt Preview" className="h-full w-full object-cover rounded-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="flex items-center gap-1 text-xs font-bold text-forest">
              <CheckCircle2 className="h-3.5 w-3.5" /> Na-attach na ang resibo
            </span>
            <p className="text-[11px] text-muted truncate">Handa nang isumite kasama ang iyong detalye.</p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            title="Alisin ang resibo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-paper px-4 py-6 text-center cursor-pointer hover:bg-paper-card transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest/10 text-forest">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-forest-deep">I-click para mag-upload ng resibo</p>
            <p className="text-[10px] text-muted mt-0.5">PNG, JPG o JPEG (Hanggang 5MB)</p>
          </div>
          <input
            type="file"
            accept="image/*"
            required
            onChange={onFileChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}