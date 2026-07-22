"use client";

import { AuditLog } from "@/src/types/dashboard";

const AUDIT_LOGS: AuditLog[] = [
  { id: "1", adminName: "Juan (Admin)", action: "Inaprubahan ang kuryente", target: "Unit 201", timestamp: "11:30 AM" },
  { id: "2", adminName: "Juan (Admin)", action: "Nagbago ng presyo ng tubig", target: "Settings", timestamp: "Kahapon" },
  { id: "3", adminName: "SuperAdmin", action: "Nag-delete ng tenant record", target: "ID #88", timestamp: "July 21" },
];

export function AdminAuditLogs() {
  return (
    <div className="rounded-2xl border border-line bg-paper-card p-5 shadow-sm space-y-4">
      {/* Header with Document / Clipboard SVG Icon */}
      <div className="flex items-center gap-2.5 border-b border-line pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest/10 text-forest shrink-0">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <h3 className="font-display text-base font-bold text-forest-deep sm:text-lg">
          Admin Audit Logs
        </h3>
      </div>

      <div className="space-y-2">
        {AUDIT_LOGS.map((log) => (
          <div key={log.id} className="flex items-center justify-between rounded-lg bg-paper p-2.5 text-xs">
            <div>
              <span className="font-bold text-forest">{log.adminName}</span>{" "}
              <span className="text-muted">{log.action}</span>{" "}
              <span className="font-semibold text-ink">({log.target})</span>
            </div>
            <span className="font-mono-brand text-[10px] text-muted">{log.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}