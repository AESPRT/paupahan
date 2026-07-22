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
  icon: string;
  lastGenerated: string;
  fileSize: string;
}