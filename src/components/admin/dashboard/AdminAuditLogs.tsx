import { AuditLog } from "@/src/types/dashboard";

const AUDIT_LOGS: AuditLog[] = [
  { id: "1", adminName: "Juan (Admin)", action: "Inaprubahan ang kuryente", target: "Unit 201", timestamp: "11:30 AM" },
  { id: "2", adminName: "Juan (Admin)", action: "Nagbago ng presyo ng tubig", target: "Settings", timestamp: "Kahapon" },
  { id: "3", adminName: "SuperAdmin", action: "Nag-delete ng tenant record", target: "ID #88", timestamp: "July 21" },
];

export function AdminAuditLogs() {
  return (
    <div className="rounded-2xl border border-line bg-paper-card p-5 shadow-sm">
      <h3 className="font-display text-lg font-bold text-forest-deep">
        📝 Admin Audit Logs
      </h3>

      <div className="mt-4 space-y-2">
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