"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Tenant } from "@/src/types/tenant/tenant";

interface TenantDetailModalProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TenantDetailModal({ tenant, isOpen, onClose }: TenantDetailModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    if (isOpen && tenant && tenant.loginCode) {
      const baseUrl = window.location.origin;
      const loginUrl = `${baseUrl}/tenant/login?code=${tenant.loginCode}`;

      QRCode.toDataURL(loginUrl, { width: 300, margin: 2 })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("Error generating QR code:", err));
    }
  }, [isOpen, tenant]);

  if (!isOpen || !tenant) return null;

  // Helper para sa badge color base sa leaseStatus enum ('active', 'pending', 'moving_out', 'inactive')
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20";
      case "pending":
        return "bg-marigold/10 text-marigold-deep border border-marigold/20";
      case "moving_out":
        return "bg-coral/10 text-coral-deep border border-coral/20";
      default:
        return "bg-muted/10 text-muted border border-muted/20";
    }
  };

  // Helper para sa pag-format ng petsa (idinagdag ang null sa type)
  const formatDate = (dateInput?: string | Date | null) => {
    if (!dateInput) return "N/A";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("fil-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Siguraduhing magiging undefined ang null para hindi magreklamo ang TypeScript
  const displayMovedInDate = tenant.movedInDate ?? tenant.startDate ?? undefined;

  // Kunin ang due date (kung wala, gamitin ang araw mula sa moved in date)
  const rawDueDay = tenant.dueDate ?? tenant.dueDay;
  const displayDueDate = rawDueDay
    ? `Araw ng ${rawDueDay}`
    : displayMovedInDate
      ? `Araw ng ${new Date(displayMovedInDate).getDate()}`
      : "N/A";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-xs p-2 sm:p-4">
      {/* Full view modal container na may nakatakdang taas at overflow-hidden sa labas */}
      <div className="relative w-full max-w-2xl h-[92vh] sm:h-[88vh] rounded-2xl bg-paper-card shadow-2xl border border-line flex flex-col overflow-hidden">

        {/* Fixed Header */}
        <div className="flex justify-between items-start border-b border-line p-5 bg-paper-card shrink-0">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-muted block mb-1">
              Impormasyon ng Tenant
            </span>
            <h3 className="text-xl font-bold font-display text-ink">{tenant.fullName}</h3>
            <p className="text-xs font-medium text-forest mt-0.5 flex items-center gap-1">
              <span>🏠 Unit: {tenant.unitName || "N/A"}</span>
              {tenant.roomNumber && <span>• Room {tenant.roomNumber}</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-xs rounded-full font-semibold capitalize ${getStatusBadgeStyle(tenant.leaseStatus)}`}>
              {tenant.leaseStatus.replace("_", " ")}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-muted hover:bg-line/60 transition-colors cursor-pointer"
              aria-label="Isara"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Personal Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2 font-mono">
              Personal Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-paper p-3 rounded-xl border border-line">
              <div>
                <span className="text-[11px] text-muted block">Email Address</span>
                <span className="font-medium text-ink text-xs truncate block">{tenant.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[11px] text-muted block">Numero ng Telepono</span>
                <span className="font-medium text-ink text-xs block">{tenant.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2 font-mono">
              Emergency Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-paper p-3 rounded-xl border border-line">
              <div>
                <span className="text-[11px] text-muted block">Pangalan</span>
                <span className="font-medium text-ink text-xs block">{tenant.emergencyContactName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[11px] text-muted block">Contact Number</span>
                <span className="font-medium text-ink text-xs block">{tenant.emergencyContactPhone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Financial & Rent Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2 font-mono">
              Financial & Lease Summary
            </h4>
            <div className="space-y-1.5 bg-paper p-3 rounded-xl border border-line text-xs">
              <div className="flex justify-between py-1 border-b border-line/50">
                <span className="text-muted">Petsa ng Paglipat (Moved In):</span>
                <span className="font-semibold text-ink">{formatDate(displayMovedInDate)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line/50">
                <span className="text-muted">Buwanang Takdang Araw (Due Date):</span>
                <span className="font-semibold text-ink">{displayDueDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line/50">
                <span className="text-muted">Buwanang Upa (Monthly Rent):</span>
                <span className="font-bold text-ink">₱{tenant.monthlyRent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line/50">
                <span className="text-muted">Advance Rent ({tenant.advanceMonths || 0} mos):</span>
                <span className="font-medium text-ink">₱{tenant.advanceAmount?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line/50">
                <span className="text-muted">Security Deposit ({tenant.depositMonths || 0} mos):</span>
                <span className="font-medium text-ink">₱{tenant.depositAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 pt-1.5">
                <span className="text-muted">Payment Status:</span>
                <span className="font-bold uppercase text-emerald-700 tracking-wider text-[11px]">
                  {tenant.paymentStatus || 'Paid'}
                </span>
              </div>
            </div>
          </div>

          {/* Login Code & QR Code Section */}
          <div className="relative flex flex-col items-center justify-center space-y-3 p-4 bg-paper rounded-xl border border-line">
            <div className="text-center w-full">
              <p className="text-xs font-mono font-semibold text-muted mb-1 uppercase tracking-wider">Tenant Portal Login Code</p>
              <div className="inline-block rounded-xl bg-paper-card border border-line px-5 py-2 font-mono text-lg font-bold tracking-widest text-forest shadow-xs">
                {tenant.loginCode || 'Wala pang Code'}
              </div>
            </div>

            {qrCodeUrl && (
              <div className="flex flex-col items-center space-y-2 pt-2">
                <div className="rounded-xl bg-white p-3 border border-line shadow-xs">
                  <img src={qrCodeUrl} alt="Tenant QR Code" className="w-36 h-36 object-contain" />
                </div>
                <a
                  href={qrCodeUrl}
                  download={`QR-${tenant.fullName.replace(/\s+/g, '-')}.png`}
                  className="text-xs text-forest font-semibold hover:text-forest-deep hover:underline inline-flex items-center gap-1.5 transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3.5 h-3.5"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  I-download ang QR Code
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer Close Button */}
        <div className="border-t border-line p-4 bg-paper-card shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-forest text-paper px-4 py-2.5 text-sm font-semibold hover:bg-forest-deep w-full transition-all shadow-sm cursor-pointer"
          >
            Isara ang Detalye
          </button>
        </div>

      </div>
    </div>
  );
}