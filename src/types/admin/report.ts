import { ReactNode } from "react";

export type ExportFormat = "pdf" | "docs" | "csv";

export interface FinancialReportSummary {
  period: string;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  occupancyRate: number;
}

export interface ReportCategory {
  id: string;
  title: string;
  description: string;
  icon: ReactNode; // 👈 Pinalitan mula string patungong ReactNode para payagan ang SVG elements
  lastGenerated: string;
  fileSize: string;
}