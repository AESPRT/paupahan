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
        return "bg-emerald-500/10 text-emerald-600";
      case "pending":
        return "bg-amber-500/10 text-amber-600";
      case "moving_out":
        return "bg-coral/10 text-coral";
      default:
        return "bg-muted/10 text-muted";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-paper-card p-6 shadow-xl border border-line space-y-4">
        
        {/* Header na may Tenant Details at Close Button (SVG) */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-foreground">{tenant.fullName}</h3>
            <p className="text-xs text-muted">{tenant.unitName} - Room {tenant.roomNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize ${getStatusBadgeStyle(tenant.leaseStatus)}`}>
              {tenant.leaseStatus.replace("_", " ")}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-muted hover:bg-line transition-colors cursor-pointer"
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

        <div className="space-y-2 border-y border-line py-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Email:</span>
            <span className="font-medium text-foreground">{tenant.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Telepono:</span>
            <span className="font-medium text-foreground">{tenant.phone || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Buwanang Upa:</span>
            <span className="font-medium text-foreground">₱{tenant.monthlyRent.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Deposit:</span>
            <span className="font-medium text-foreground">₱{tenant.depositAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Login Code & QR Code Section */}
        <div className="flex flex-col items-center justify-center space-y-3 pt-2">
          <div className="text-center">
            <p className="text-xs font-medium text-muted mb-1">Tenant Login Code</p>
            <span className="rounded-lg bg-background border border-line px-4 py-1.5 font-mono text-base font-bold tracking-wider text-forest">
              {tenant.loginCode || 'Wala pang Code'}
            </span>
          </div>

          {qrCodeUrl && (
            <div className="flex flex-col items-center space-y-2">
              <div className="rounded-xl bg-white p-2 border border-line shadow-sm">
                <img src={qrCodeUrl} alt="Tenant QR Code" className="w-40 h-40 object-contain" />
              </div>
              <a 
                href={qrCodeUrl} 
                download={`QR-${tenant.fullName.replace(/\s+/g, '-')}.png`}
                className="text-xs text-forest font-semibold hover:underline inline-flex items-center gap-1"
              >
                {/* Download Icon SVG */}
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

        <div className="pt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-forest text-paper px-4 py-2 text-sm font-semibold hover:bg-forest-deep w-full transition-all cursor-pointer"
          >
            Isara
          </button>
        </div>
      </div>
    </div>
  );
}