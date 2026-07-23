"use client";

import { useState } from "react";
import { Unit, Room } from "@/src/types/admin/unit";
import { UnitsHeader } from "./UnitsHeader";
import { UnitCard } from "./UnitCard";
import { AddRoomModal } from "./AddRoomModal";
import { AddUnitModal } from "./AddUnitModal";
import { Footer } from "@/src/components/landing/Footer";
import { addRoomAction, addUnitAction } from "@/src/actions/units-actions";

interface UnitsClientWrapperProps {
  initialUnits: Unit[];
  totalUnits: number;
  totalRooms: number;
  vacantRooms: number;
}

export default function UnitsClientWrapper({
  initialUnits,
  totalUnits: initialTotalUnits,
  totalRooms: initialTotalRooms,
  vacantRooms: initialVacantRooms,
}: UnitsClientWrapperProps) {
  // 1. Gawing state ang units para madali nating ma-update nang realtime
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [selectedUnitForRoom, setSelectedUnitForRoom] = useState<Unit | null>(null);
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);

  // Dynamic calculations para sa stats na magbabago agad kasabay ng state
  const totalUnits = units.length;
  const allRooms = units.flatMap((u) => u.rooms);
  const totalRooms = allRooms.length;
  const vacantRooms = allRooms.filter((r) => r.status === "Vacant").length;

  const handleAddRoom = async (newRoomData: Omit<Room, "id">) => {
    if (!selectedUnitForRoom) return;

    const result = await addRoomAction(
      selectedUnitForRoom.id,
      newRoomData.roomNumber,
      Number(newRoomData.monthlyRent)
    );

    if (result.success) {
      // 2. Realtime update para sa Rooms nang walang server page refresh
      setUnits((prevUnits) =>
        prevUnits.map((unit) => {
          if (unit.id === selectedUnitForRoom.id) {
            const newRoom = {
              id: Date.now().toString(), // Pansamantalang ID habang nag-aantay sa sync
              roomNumber: newRoomData.roomNumber,
              status: "Vacant" as const,
              monthlyRent: Number(newRoomData.monthlyRent),
            };
            return {
              ...unit,
              totalRooms: unit.rooms.length + 1,
              rooms: [...unit.rooms, newRoom],
            };
          }
          return unit;
        })
      );

      setSelectedUnitForRoom(null);
    } else {
      alert(result.error);
    }
  };

  const handleAddUnit = async (unitName: string) => {
    const result = await addUnitAction(unitName);

    if (result.success) {
      // 3. Realtime update para sa Units nang walang server page refresh
      // Gumawa tayo ng mock object para maidagdag agad sa UI list
      const newUnit: Unit = {
        id: Date.now().toString(),
        name: `${initialUnits[0]?.name.split(" - ")[0] || "Property"} - ${unitName}`,
        address: initialUnits[0]?.address || "",
        totalRooms: 0,
        rooms: [],
      };

      setUnits((prev) => [newUnit, ...prev]);
      setIsAddUnitOpen(false);
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header Section (Magbabago nang realtime ang mga bilang) */}
      <UnitsHeader
        totalUnits={totalUnits}
        totalRooms={totalRooms}
        vacantRooms={vacantRooms}
        onAddUnit={() => setIsAddUnitOpen(true)}
      />

      {/* List of Units */}
      <div className="space-y-6">
        {units.length > 0 ? (
          units.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              onOpenAddRoom={(unitToEdit) => setSelectedUnitForRoom(unitToEdit)}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-line bg-paper-card p-12 text-center">
            <p className="text-sm text-muted">Walang nahanap na mga property o unit sa database.</p>
          </div>
        )}
      </div>

      {/* Add Room Modal Dialog */}
      <AddRoomModal
        isOpen={!!selectedUnitForRoom}
        unitName={selectedUnitForRoom?.name || ""}
        onClose={() => setSelectedUnitForRoom(null)}
        onAddRoom={handleAddRoom}
      />

      {/* Add Unit Modal Dialog */}
      <AddUnitModal
        isOpen={isAddUnitOpen}
        propertyName={units[0]?.name || "Pangunahing Property"}
        onClose={() => setIsAddUnitOpen(false)}
        onAddUnit={handleAddUnit}
      />

      <Footer showNavLinks={false} />
    </div>
  );
}