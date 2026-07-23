import { AmenityFee } from "@/src/types/tenant/tenant-utilities";

interface AmenityCardProps {
  amenity: AmenityFee;
}

export function AmenityCard({ amenity }: AmenityCardProps) {
  return (
    <div
      className={`rounded-3xl border p-5 shadow-sm space-y-2 transition-all ${
        amenity.isIncluded
          ? "border-forest/30 bg-paper-card"
          : "border-line bg-paper/60"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`rounded-md border px-2 py-0.5 font-mono-brand text-[9px] font-bold ${
            amenity.isIncluded
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-gray-200 bg-gray-100 text-gray-600"
          }`}
        >
          {amenity.isIncluded ? "Kabilang sa Bill" : "Hindi Kabilang"}
        </span>
        <span className="font-mono-brand text-[10px] text-muted">
          {amenity.billingType}
        </span>
      </div>

      <h3 className="font-display text-sm font-bold text-forest-deep">
        {amenity.name}
      </h3>

      <div className="font-display text-lg font-bold text-forest-deep">
        ₱{amenity.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
        <span className="font-mono-brand text-[10px] font-normal text-muted"> /buwan</span>
      </div>

      <p className="text-[11px] text-muted leading-snug">
        {amenity.description}
      </p>
    </div>
  );
}