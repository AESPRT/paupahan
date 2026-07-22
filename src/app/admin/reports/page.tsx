"use client";

import { ReportsHeader } from "@/src/components/admin/reports/ReportsHeader";
import { ReportCard } from "@/src/components/admin/reports/ReportCard";
import { ExportHistory } from "@/src/components/admin/reports/ExportHistory";
import { FinancialReportSummary, ReportCategory, ExportFormat } from "@/src/types/report";
import { Footer } from "@/src/components/landing/Footer";

const FINANCIAL_SUMMARY: FinancialReportSummary = {
  period: "Hulyo 2026",
  totalRevenue: 184500,
  totalExpenses: 24200,
  netIncome: 160300,
  occupancyRate: 92,
};

const REPORTS_LIST: ReportCategory[] = [
  {
    id: "rep-income",
    title: "Financial & Income Statement",
    description: "Buong ulat ng koleksyon ng renta, utilities, at natanggap na bayad sa napiling buwan.",
    icon: "💰",
    lastGenerated: "Ngayon",
    fileSize: "1.2 MB",
  },
  {
    id: "rep-tenants",
    title: "Tenant Masterlist & Records",
    description: "Talaan ng lahat ng aktibong tenant, contact numbers, emergency contact, at kasunduan.",
    icon: "👥",
    lastGenerated: "Kahapon",
    fileSize: "850 KB",
  },
  {
    id: "rep-unpaid",
    title: "Overdue & Balanse (Delinquency)",
    description: "Listahan ng mga hindi pa nakakabayad ng renta, late fees, at natitirang balance.",
    icon: "⚠️",
    lastGenerated: "July 20, 2026",
    fileSize: "512 KB",
  },
  {
    id: "rep-utilities",
    title: "Sub-meter & Utility Readings",
    description: "Ulat sa pagkonsumo ng kuryente at tubig ng bawat kwarto kasama ang dating readings.",
    icon: "⚡",
    lastGenerated: "July 18, 2026",
    fileSize: "1.5 MB",
  },
  {
    id: "rep-occupancy",
    title: "Occupancy & Vacancy Report",
    description: "Status ng bawat kwarto (Occupied, Vacant, Under Maintenance) para sa property planning.",
    icon: "🏢",
    lastGenerated: "July 15, 2026",
    fileSize: "620 KB",
  },
  {
    id: "rep-expenses",
    title: "Maintenance & Expenses Log",
    description: "Talaan ng mga ginastos sa pagkumpuni, pasahod, at pangkalahatang maintenance.",
    icon: "🛠️",
    lastGenerated: "July 10, 2026",
    fileSize: "940 KB",
  },
];

export default function ReportsPage() {
  const handleDownload = (reportId: string, format: ExportFormat) => {
    const report = REPORTS_LIST.find((r) => r.id === reportId);
    alert(`Inihahanda ang pag-download ng "${report?.title}" sa [${format.toUpperCase()}] format.`);
  };

  const handleGenerateAll = () => {
    alert("Ibinabalot ang lahat ng ulat sa isang ZIP file para ma-download.");
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header & Quick Financial Overview */}
      <ReportsHeader summary={FINANCIAL_SUMMARY} onGenerateAll={handleGenerateAll} />

      {/* Reports Categories Grid */}
      <div className="space-y-4">
        <h2 className="font-mono-brand text-xs font-bold uppercase tracking-wider text-muted">
          Mga Pwedeng I-download na Ulat
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REPORTS_LIST.map((report) => (
            <ReportCard key={report.id} report={report} onDownload={handleDownload} />
          ))}
        </div>
      </div>

      {/* Recent Download Logs */}
      <ExportHistory />

      <Footer showNavLinks = {false} />
    </div>
  );
}