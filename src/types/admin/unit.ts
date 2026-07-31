// Enum para sa mga uri ng unit sa paupahan
export enum UnitType {
  STUDIO = "Studio",
  ONE_BEDROOM = "1-Bedroom",
  TWO_BEDROOM = "2-Bedroom",
  THREE_BEDROOM = "3-Bedroom",
  BEDSPACE = "Bedspace",
  SOLO_ROOM = "Solo Room / Private Room",
  TRANSIENT = "Transient",
  COMMERCIAL = "Commercial Space",
}

// 👈 Enum para sa Palapag / Floor Level ng Unit
export enum UnitFloor {
  GROUND = "Ground Floor",
  SECOND = "2nd Floor",
  THIRD = "3rd Floor",
  FOURTH = "4th Floor",
  FIFTH_ABOVE = "5th Floor & Above",
  BASEMENT = "Basement",
  MEZZANINE = "Mezzanine",
}

// 👈 Default floor na gagamitin kapag walang partikular na idineklara
export const DEFAULT_UNIT_FLOOR = UnitFloor.GROUND;

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
  monthlyRent?: number; // Suporta para sa unit-level renting
  unitStatus?: string;
  unitLeaseStatus?: RoomStatus; // Opsyonal para sa status ng buong unit
  unitTenantName?: string; // Opsyonal para sa pangalan ng tenant sa unit-level

  // Mga idinagdag para sa Edit/Add Unit Modals
  floor?: UnitFloor; // 👈 Ginamit na ang UnitFloor enum dito
  type?: UnitType;
  description?: string;
}