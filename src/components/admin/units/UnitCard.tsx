"use client";

import { Unit, Room } from "@/src/types/unit";

interface UnitCardProps {
  unit: Unit;
  onOpenAddRoom: (unit: Unit) => void;
}

export function UnitCard({ unit, onOpenAddRoom }: UnitCardProps) {
  const getRoomBadge = (status: Room["status"]) => {
    switch (status) {
      case "Occupied":
        return "bg-forest/10 text-forest border-forest/20";
      case "Vacant":
        return "bg-coral/15 text-coral-deep border-coral/30";
      case "Maintenance":
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="rounded-3xl border border-line bg-paper-card p-5 shadow-sm transition-all hover:shadow-md">
      {/* Header: Unit Info & Add Room Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line/60 pb-4">
        <div>
          <h3 className="font-display text-lg font-bold text-forest-deep">
            {unit.name}
          </h3>
          <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
            <span>📍</span> {unit.address}
          </p>
        </div>

        <button
          onClick={() => onOpenAddRoom(unit)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-forest/30 bg-forest/5 px-3.5 py-2 font-mono-brand text-xs font-bold text-forest hover:bg-forest hover:text-white transition-all self-start sm:self-auto"
        >
          <span>+</span> Magdagdag ng Kwarto
        </button>
      </div>

      {/* Rooms Grid */}
      <div className="mt-4">
        <h4 className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted mb-3">
          Mga Kwarto ({unit.rooms.length})
        </h4>

        {unit.rooms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-6 text-center text-xs text-muted">
            Wala pang kwarto na nakarehistro sa unit na ito.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {unit.rooms.map((room) => (
              <div
                key={room.id}
                className="flex flex-col justify-between rounded-2xl border border-line/80 bg-paper p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-forest-deep text-xs sm:text-sm">
                    {room.roomNumber}
                  </span>
                  <span
                    className={`rounded-md border px-2 py-0.5 font-mono-brand text-[10px] font-bold ${getRoomBadge(
                      room.status
                    )}`}
                  >
                    {room.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-line/40">
                  <span className="text-muted text-[11px]">
                    {room.tenantName ? `👤 ${room.tenantName}` : "Walang Tenant"}
                  </span>
                  <span className="font-bold text-forest-deep">
                    ₱{room.monthlyRent.toLocaleString()}/mo
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}