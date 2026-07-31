"use client";

import { ReportCategory, ExportFormat } from "@/src/types/admin/report";

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
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-paper text-forest-deep border border-line/60">
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
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

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onDownload(report.id, "pdf")}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-coral/30 bg-coral/10 py-2 font-mono-brand text-[11px] font-bold text-coral-deep transition-all hover:bg-coral hover:text-white active:scale-95"
          >
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>PDF</span>
          </button>

          <button
            onClick={() => onDownload(report.id, "csv")}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 py-2 font-mono-brand text-[11px] font-bold text-emerald-700 transition-all hover:bg-emerald-600 hover:text-white active:scale-95"
          >
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18M9 17V9m4 8V5m4 12v-4" />
            </svg>
            <span>CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}