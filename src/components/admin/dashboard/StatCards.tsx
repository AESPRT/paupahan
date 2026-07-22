import { StatMetric } from "@/src/types/dashboard";

const STATS_DATA: StatMetric[] = [
  { title: "Kabuuan ng Rooms", value: "48", change: "+2 ngayong buwan", isPositive: true, icon: "rooms" },
  { title: "Kabuuan ng Units", value: "12", change: "Walang bago", isPositive: true, icon: "units" },
  { title: "Occupied Rooms", value: "42", change: "87.5% Occupancy", isPositive: true, icon: "occupied" },
  { title: "Bakanteng Rooms", value: "6", change: "Kailangan punan", isPositive: false, icon: "vacant" },
  { title: "Buwanang Kita", value: "₱184,500", change: "+12.4% vs huling buwan", isPositive: true, icon: "revenue" },
  { title: "Pending Bills", value: "₱24,800", change: "5 tenant hindi pa nagbabayad", isPositive: false, icon: "pending" },
];

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {STATS_DATA.map((stat) => (
        <div
          key={stat.title}
          className="relative overflow-hidden rounded-2xl border border-line bg-paper-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            {stat.title}
          </span>
          <div className="mt-2 font-display text-2xl font-bold text-forest-deep">
            {stat.value}
          </div>
          {stat.change && (
            <p
              className={`mt-1 text-[11px] font-semibold ${
                stat.isPositive ? "text-forest" : "text-coral-deep"
              }`}
            >
              {stat.change}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}