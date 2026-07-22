export interface AdminProfileData {
  id: string;
  fullName: string;
  role: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  joinedDate: string;
  managedPropertiesCount: number;
  totalRoomsCount: number;
  activeTenantsCount: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  category: "Billing" | "Tenant" | "Maintenance" | "Security";
}