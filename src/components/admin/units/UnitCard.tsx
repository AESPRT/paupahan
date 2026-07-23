"use client";

import { Unit, Room } from "@/src/types/admin/unit";

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
          {/* Location / Address with Pin SVG Icon */}
          <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
            <svg className="h-3.5 w-3.5 shrink-0 text-muted/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{unit.address}</span>
          </div>
        </div>

        <button
          onClick={() => onOpenAddRoom(unit)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-forest/30 bg-forest/5 px-3.5 py-2 font-mono-brand text-xs font-bold text-forest hover:bg-forest hover:text-white transition-all self-start sm:self-auto"
        >
          {/* Plus / Add SVG Icon */}
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>Magdagdag ng Kwarto</span>
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
                  <div className="flex items-center gap-1.5 text-muted text-[11px]">
                    {room.tenantName ? (
                      <>
                        {/* User SVG Icon */}
                        <svg className="h-3.5 w-3.5 shrink-0 text-muted/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{room.tenantName}</span>
                      </>
                    ) : (
                      <span>Walang Tenant</span>
                    )}
                  </div>
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