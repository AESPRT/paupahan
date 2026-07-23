export type PriorityLevel = "Low" | "Medium" | "High" | "Emergency";
export type MaintenanceStatus = "Pending" | "In Progress" | "Resolved";

export interface MaintenanceRequest {
  id: string;
  ticketNumber: string;
  unitName: string;
  roomNumber: string;
  tenantName: string;
  category: "Plumbing" | "Electrical" | "Appliance" | "Structural" | "Others";
  issueTitle: string;
  description: string;
  priority: PriorityLevel;
  status: MaintenanceStatus;
  dateReported: string;
  estimatedCost?: number;
}