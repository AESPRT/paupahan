export type RoomStatus = "Occupied" | "Vacant" | "Maintenance" | "Reserved";

export interface Room {
  id: string;
  roomNumber: string;
  status: RoomStatus;
  monthlyRent: number;
  tenantName?: string;
}

export interface Unit {
  id: string;
  name: string; // e.g., "Building A - Unit 101"
  address: string;
  totalRooms: number;
  rooms: Room[];
  monthlyRent?: number; // 👈 Idagdag ito para suportahan ang unit-level renting
  unitStatus?: string;
  unitLeaseStatus?: RoomStatus; // 👈 Opsyonal para sa status ng buong unit
  unitTenantName?: string; // 👈 Opsyonal para sa pangalan ng tenant sa unit-level
}