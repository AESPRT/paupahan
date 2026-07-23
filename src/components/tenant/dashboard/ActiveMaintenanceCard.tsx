"use client";

import { TenantDashboardData } from "@/src/types/tenant/tenant-dashboard";

interface ActiveMaintenanceCardProps {
  ticket?: TenantDashboardData["activeTicket"];
}

export function ActiveMaintenanceCard({ ticket }: ActiveMaintenanceCardProps) {
  if (!ticket) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-3xl border border-line bg-paper-card p-5 text-center shadow-sm">
        {/* Check Circle SVG Icon */}
        <svg className="h-4 w-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-muted">Walang aktibong report o sira sa iyong kwarto.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-line bg-paper-card p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-2.5">
        <div className="flex items-center gap-2">
          {/* Wrench / Maintenance SVG Icon */}
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-forest/10 text-forest shrink-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="font-display text-sm font-bold text-forest-deep">
            Maintenance Request Status
          </h2>
        </div>
        <span className="rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 font-mono-brand text-[10px] font-bold text-amber-800">
          {ticket.status}
        </span>
      </div>

      {/* Ticket Details & Photo Preview */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1 text-xs">
          <p className="font-bold text-forest-deep">{ticket.title}</p>
          <p className="text-[11px] text-muted">Ticket ID: {ticket.id}</p>
          <p className="font-mono-brand text-[10px] text-muted pt-1">Petsa: {ticket.createdAt}</p>
        </div>

        {/* Photo Preview (Kung mayroon mang photoUrl o proofPhotoUrl ang ticket) */}
        {ticket.photoUrl && (
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ticket.photoUrl}
              alt="Maintenance Proof"
              className="h-20 w-28 rounded-xl object-cover border border-line shadow-xs"
            />
          </div>
        )}
      </div>
    </div>
  );
}