"use client";

import { ReportCategory, ExportFormat } from "@/src/types/report";

interface ReportCardProps {
  report: ReportCategory;
  onDownload: (reportId: string, format: ExportFormat) => void;
}

export function ReportCard({ report, onDownload }: ReportCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-3xl border border-line bg-paper-card p-5 shadow-sm transition-all hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-paper text-2xl border border-line/60">
              {report.icon}
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-forest-deep">
                {report.title}
              </h3>
              <span className="font-mono-brand text-[10px] text-muted">
                Huling inayos: {report.lastGenerated} • {report.fileSize}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted">
          {report.description}
        </p>
      </div>

      {/* Export / Download Action Buttons */}
      <div className="mt-6 border-t border-line/60 pt-4">
        <span className="block font-mono-brand text-[10px] font-bold uppercase tracking-wider text-muted mb-2">
          I-download bilang:
        </span>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onDownload(report.id, "pdf")}
            className="flex items-center justify-center gap-1 rounded-xl border border-coral/30 bg-coral/10 py-2 font-mono-brand text-[11px] font-bold text-coral-deep transition-all hover:bg-coral hover:text-white active:scale-95"
          >
            <span>📄</span> PDF
          </button>

          <button
            onClick={() => onDownload(report.id, "docs")}
            className="flex items-center justify-center gap-1 rounded-xl border border-blue-200 bg-blue-50 py-2 font-mono-brand text-[11px] font-bold text-blue-700 transition-all hover:bg-blue-600 hover:text-white active:scale-95"
          >
            <span>📝</span> DOCS
          </button>

          <button
            onClick={() => onDownload(report.id, "csv")}
            className="flex items-center justify-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 py-2 font-mono-brand text-[11px] font-bold text-emerald-700 transition-all hover:bg-emerald-600 hover:text-white active:scale-95"
          >
            <span>📊</span> CSV
          </button>
        </div>
      </div>
    </div>
  );
}