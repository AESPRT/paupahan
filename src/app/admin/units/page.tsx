"use client";

import { useState } from "react";
import { UnitsHeader } from "@/src/components/admin/units/UnitsHeader";
import { UnitCard } from "@/src/components/admin/units/UnitCard";
import { AddRoomModal } from "@/src/components/admin/units/AddRoomModal";
import { Unit, Room } from "@/src/types/unit";
import { Footer } from "@/src/components/landing/Footer";

const INITIAL_UNITS: Unit[] = [
  {
    id: "u1",
    name: "Building A - Sampaloc Main",
    address: "123 Loyalty St., Sampaloc, Manila",
    totalRooms: 3,
    rooms: [
      { id: "r1", roomNumber: "Room 101", status: "Occupied", monthlyRent: 6500, tenantName: "Juan Dela Cruz" },
      { id: "r2", roomNumber: "Room 102", status: "Vacant", monthlyRent: 6000 },
      { id: "r3", roomNumber: "Room 103", status: "Maintenance", monthlyRent: 6500 },
    ],
  },
  {
    id: "u2",
    name: "Building B - Cubao Annex",
    address: "45 Aurora Blvd., Cubao, Quezon City",
    totalRooms: 2,
    rooms: [
      { id: "r4", roomNumber: "Room 201", status: "Occupied", monthlyRent: 7500, tenantName: "Maria Clara" },
      { id: "r5", roomNumber: "Room 202", status: "Occupied", monthlyRent: 7500, tenantName: "Pedro Penduko" },
    ],
  },
];

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>(INITIAL_UNITS);
  const [selectedUnitForRoom, setSelectedUnitForRoom] = useState<Unit | null>(null);

  // Add Room Logic
  const handleAddRoom = (newRoomData: Omit<Room, "id">) => {
    if (!selectedUnitForRoom) return;

    const newRoom: Room = {
      ...newRoomData,
      id: `r-${Date.now()}`,
    };

    setUnits((prevUnits) =>
      prevUnits.map((u) => {
        if (u.id === selectedUnitForRoom.id) {
          return {
            ...u,
            totalRooms: u.totalRooms + 1,
            rooms: [...u.rooms, newRoom],
          };
        }
        return u;
      })
    );
  };

  // Calculations for Stats
  const totalUnits = units.length;
  const allRooms = units.flatMap((u) => u.rooms);
  const totalRooms = allRooms.length;
  const vacantRooms = allRooms.filter((r) => r.status === "Vacant").length;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <UnitsHeader
        totalUnits={totalUnits}
        totalRooms={totalRooms}
        vacantRooms={vacantRooms}
        onAddUnit={() => alert("Open Add Unit Modal")}
      />

      {/* List of Units */}
      <div className="space-y-6">
        {units.map((unit) => (
          <UnitCard
            key={unit.id}
            unit={unit}
            onOpenAddRoom={(unitToEdit) => setSelectedUnitForRoom(unitToEdit)}
          />
        ))}
      </div>

      {/* Add Room Modal Dialog */}
      <AddRoomModal
        isOpen={!!selectedUnitForRoom}
        unitName={selectedUnitForRoom?.name || ""}
        onClose={() => setSelectedUnitForRoom(null)}
        onAddRoom={handleAddRoom}
      />

      <Footer showNavLinks = {false} />
    </div>
  );
}