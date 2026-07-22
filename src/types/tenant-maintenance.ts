export type MaintenancePriority = "Low" | "Medium" | "High" | "Emergency";
export type MaintenanceStatus = "Pending" | "In Progress" | "Resolved" | "Rejected";
export type MaintenanceCategory = "Plumbing" | "Electrical" | "Appliance" | "Structural" | "Others";

export interface MaintenanceTicket {
  id: string;
  title: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  description: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt?: string;
  adminRemark?: string; // Feedback o note mula kay Landlord
}