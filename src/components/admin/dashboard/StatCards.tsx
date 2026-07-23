import { StatMetric } from "@/src/types/admin/dashboard";

interface StatCardsProps {
  stats?: {
    totalProperties: number;
    totalUnits: number;
    totalRooms: number;
    occupiedRooms: number;
    vacantRooms: number;
    monthlyRevenue: number;
    pendingBillsAmount: number;
    occupancyRate: number;
  };
}

export function StatCards({ stats }: StatCardsProps) {
  // Fallback values kung sakaling hindi pa maipasa ang stats
  const data = stats || {
    totalProperties: 0,
    totalUnits: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    vacantRooms: 0,
    monthlyRevenue: 0,
    pendingBillsAmount: 0,
    occupancyRate: 0,
  };

  const occupancyRateFormatted = `${data.occupancyRate.toFixed(1)}% Occupancy`;
  const formattedRevenue = new Intl.NumberFormat('fil-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(data.monthlyRevenue);

  const formattedPending = new Intl.NumberFormat('fil-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(data.pendingBillsAmount);

  const STATS_DATA: StatMetric[] = [
    { 
      title: "Kabuuan ng Rooms", 
      value: data.totalRooms.toString(), 
      change: "Aktibong kuwarto", 
      isPositive: true, 
      icon: "rooms" 
    },
    { 
      title: "Kabuuan ng Units", 
      value: data.totalUnits.toString(), 
      change: "Buildings / Floors", 
      isPositive: true, 
      icon: "units" 
    },
    { 
      title: "Occupied Rooms", 
      value: data.occupiedRooms.toString(), 
      change: occupancyRateFormatted, 
      isPositive: true, 
      icon: "occupied" 
    },
    { 
      title: "Bakanteng Rooms", 
      value: data.vacantRooms.toString(), 
      change: data.vacantRooms > 0 ? "Kailangan punan" : "Puno na lahat", 
      isPositive: data.vacantRooms === 0, 
      icon: "vacant" 
    },
    { 
      title: "Buwanang Kita", 
      value: formattedRevenue, 
      change: "Koleksyon ngayong buwan", 
      isPositive: true, 
      icon: "revenue" 
    },
    { 
      title: "Pending Bills", 
      value: formattedPending, 
      change: "Kailangang singilin", 
      isPositive: false, 
      icon: "pending" 
    },
  ];

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
          <div className="mt-2 font-display text-xl font-bold text-forest-deep truncate">
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