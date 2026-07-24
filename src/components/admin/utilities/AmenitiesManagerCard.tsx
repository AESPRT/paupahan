"use client";

interface AmenityItem {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  description?: string;
}

interface AmenitiesManagerCardProps {
  amenities: AmenityItem[];
  onDelete: (id: string) => void;
}

export function AmenitiesManagerCard({ amenities, onDelete }: AmenitiesManagerCardProps) {
  if (amenities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-paper-card py-8 px-4 text-center shadow-sm">
        <p className="text-xs text-muted">Wala pang nakalagay na amenities. I-click ang &quot;Magdagdag ng Amenity&quot; sa itaas.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {amenities.map((item) => (
        <div key={item.id} className="relative flex flex-col justify-between rounded-2xl border border-line bg-paper-card p-4 shadow-sm space-y-3">
          <div>
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-forest-deep text-sm">{item.name}</h3>
              <span className="rounded-full bg-forest/10 px-2.5 py-0.5 font-mono-brand text-[10px] font-bold text-forest">
                {item.frequency}
              </span>
            </div>
            {item.description && (
              <p className="text-xs text-muted mt-1">{item.description}</p>
            )}
          </div>

          <div className="flex items-end justify-between pt-2 border-t border-line/60">
            <div>
              <span className="text-[10px] text-muted block">Halaga</span>
              <span className="font-display text-lg font-black text-forest-deep">
                ₱{item.amount.toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => onDelete(item.id)}
              className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 font-mono-brand text-[10px] font-bold text-red-600 hover:bg-red-100 transition-colors"
            >
              Tanggalin
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}