/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useTransition } from "react";
import { ReportsHeader } from "@/src/components/admin/reports/ReportsHeader";
import { ReportCard } from "@/src/components/admin/reports/ReportCard";
import { ExportHistory } from "@/src/components/admin/reports/ExportHistory";
import { FinancialReportSummary, ReportCategory, ExportFormat } from "@/src/types/admin/report";
import { Footer } from "@/src/components/landing/Footer";
import { getAdminReportsData, generateReportAction, generateAllReportsAction } from "@/src/actions/admin-reports";

// Helper function para ibalik ang tamang SVG icon batay sa report id
const getReportIconSvg = (id: string) => {
  switch (id) {
    case "rep-income":
      return (
        <svg className="h-5 w-5 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "rep-tenants":
      return (
        <svg className="h-5 w-5 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case "rep-unpaid":
      return (
        <svg className="h-5 w-5 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case "rep-utilities":
      return (
        <svg className="h-5 w-5 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "rep-occupancy":
      return (
        <svg className="h-5 w-5 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case "rep-expenses":
      return (
        <svg className="h-5 w-5 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return (
        <svg className="h-5 w-5 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
  }
};

export default function ReportsPage() {
  const [summary, setSummary] = useState<FinancialReportSummary>({
    period: "Kasalukuyang Buwan",
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    occupancyRate: 0,
  });
  const [reportsList, setReportsList] = useState<ReportCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const res = await getAdminReportsData();
      if (res.success) {
        if (res.financialSummary) {
          setSummary(res.financialSummary);
        }
        if (res.reportsList) {
          const formattedReports = res.reportsList.map((rep: any) => ({
            ...rep,
            icon: getReportIconSvg(rep.id),
          }));
          setReportsList(formattedReports);
        }
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const handleDownload = (reportId: string, format: ExportFormat) => {
    startTransition(async () => {
      const res = await generateReportAction(reportId, format);
      if (res.success && res.fileData && res.fileName) {
        const blob = new Blob([Buffer.from(res.fileData, "base64")], { type: res.mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert(res.error || "Nabigong i-download ang ulat.");
      }
    });
  };

  const handleGenerateAll = (format: ExportFormat = "pdf") => {
    startTransition(async () => {
      const res = await generateAllReportsAction(format);
      if (res.success && res.fileData && res.fileName) {
        const blob = new Blob([Buffer.from(res.fileData, "base64")], { type: res.mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert(res.error || "Nabigong i-download ang mga ulat.");
      }
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header & Quick Financial Overview */}
      <ReportsHeader summary={summary} onGenerateAll={handleGenerateAll} />

      {/* Reports Categories Grid */}
      <div className="space-y-4">
        <h2 className="font-mono-brand text-xs font-bold uppercase tracking-wider text-muted">
          Mga Pwedeng I-download na Ulat
        </h2>

        {isLoading ? (
          <div className="py-12 text-center font-mono-brand text-xs text-muted">
            Kinukuha ang mga ulat at datos mula sa database...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reportsList.map((report) => (
              <ReportCard key={report.id} report={report} onDownload={handleDownload} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Download Logs */}
      {/* <ExportHistory /> */}

      <Footer showNavLinks={false} />
    </div>
  );
}