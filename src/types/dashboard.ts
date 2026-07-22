export interface StatMetric {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: "rooms" | "units" | "vacant" | "occupied" | "revenue" | "pending";
}

export interface PendingReading {
  id: string;
  tenantName: string;
  unitName: string;
  type: "water" | "electricity" | "rent" | "amenities";
  readingOrAmount: string;
  dateSubmitted: string;
}

export interface ActivityNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "payment" | "tenant" | "maintenance" | "alert";
}

export interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  target: string;
  timestamp: string;
}