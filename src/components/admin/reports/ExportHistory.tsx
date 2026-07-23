"use client";

interface HistoryLog {
  id: string;
  name: string;
  format: string;
  date: string;
}

const SAMPLE_LOGS: HistoryLog[] = [
  { id: "1", name: "Ulat ng Koleksyon ngayong Hulyo 2026", format: "PDF", date: "Kanina, 2:15 PM" },
  { id: "2", name: "Masterlist ng mga Tenant at Kwarto", format: "CSV", date: "Kahapon, 10:30 AM" },
  { id: "3", name: "Utility Breakdown (Kuryente at Tubig)", format: "DOCS", date: "July 20, 2026" },
];

export function ExportHistory() {
  return (
    <div className="rounded-3xl border border-line bg-paper-card p-5 shadow-sm">
      <h2 className="font-mono-brand text-xs font-bold uppercase tracking-wider text-muted mb-4">
        Huling mga I-ninownload na Ulat (Export Logs)
      </h2>

      <div className="space-y-2.5">
        {SAMPLE_LOGS.map((log) => (
          <div
            key={log.id}
            className="flex flex-col gap-1 rounded-2xl border border-line/60 bg-paper/50 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-line bg-paper px-2 py-0.5 font-mono-brand text-[10px] font-bold uppercase text-forest-deep">
                {log.format}
              </span>
              <span className="text-xs font-bold text-forest-deep">{log.name}</span>
            </div>
            
            {/* Date with SVG Calendar Icon */}
            <div className="flex items-center gap-1 font-mono-brand text-[10px] text-muted self-end sm:self-auto">
              <svg className="h-3.5 w-3.5 shrink-0 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{log.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}