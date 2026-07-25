interface StatCardsProps {
  stats?: {
    totalProperties: number;
    totalUnits: number;
    totalRooms: number;
    occupiedRooms: number;
    vacantRooms: number;
    reservedRooms: number;
    monthlyRevenue: number;
    pendingBillsAmount: number;
    occupancyRate: number;
  };
}

export function StatCards({ stats }: StatCardsProps) {
  const data = stats || {
    totalProperties: 0,
    totalUnits: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    vacantRooms: 0,
    reservedRooms: 0,
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

  // Helper function para sa SVG Icons
  const getStatIcon = (iconType: string) => {
    switch (iconType) {
      case "rooms":
        return (
          <svg className="h-5 w-5 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case "units":
        return (
          <svg className="h-5 w-5 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
        );
      case "occupied":
        return (
          <svg className="h-5 w-5 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        );
      case "reserved":
        return (
          <svg className="h-5 w-5 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "vacant":
        return (
          <svg className="h-5 w-5 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case "revenue":
        return (
          <svg className="h-5 w-5 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "pending":
        return (
          <svg className="h-5 w-5 text-coral-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const TOP_STATS = [
    { 
      title: "KABUUAN NG ROOMS", 
      value: data.totalRooms.toString(), 
      change: "Aktibong kuwarto", 
      isPositive: true, 
      icon: "rooms",
    },
    { 
      title: "KABUUAN NG UNITS", 
      value: data.totalUnits.toString(), 
      change: "Buildings / Floors", 
      isPositive: true, 
      icon: "units",
    },
    { 
      title: "OCCUPIED ROOMS", 
      value: data.occupiedRooms.toString(), 
      change: occupancyRateFormatted, 
      isPositive: true, 
      icon: "occupied",
    },
  ];

  const BOTTOM_STATS = [
    { 
      title: "RESERVED ROOMS", 
      value: data.reservedRooms.toString(), 
      change: data.reservedRooms > 0 ? "May naghihintay lumipat" : "Walang naka-reserve", 
      isPositive: true, 
      icon: "reserved",
    },
    { 
      title: "BAKANTENG ROOMS", 
      value: data.vacantRooms.toString(), 
      change: data.vacantRooms > 0 ? "Kailangan punan" : "Puno na lahat", 
      isPositive: data.vacantRooms === 0, 
      icon: "vacant",
    },
    { 
      title: "BUWANANG KITA", 
      value: formattedRevenue, 
      change: "Koleksyon ngayong buwan", 
      isPositive: true, 
      icon: "revenue",
    },
    { 
      title: "PENDING BILLS", 
      value: formattedPending, 
      change: "Kailangang singilin", 
      isPositive: false, 
      icon: "pending",
    },
  ];

  const renderModernCard = (stat: typeof TOP_STATS[0]) => (
    <div
      key={stat.title}
      className="relative flex flex-col justify-between rounded-3xl border border-line bg-paper-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-forest/30"
    >
      <div>
        {/* Card Header: Title at Icon */}
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono-brand text-xs font-extrabold uppercase tracking-wider text-muted">
            {stat.title}
          </span>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-paper border border-line shadow-sm">
            {getStatIcon(stat.icon)}
          </div>
        </div>

        {/* Card Main Value */}
        <div className="mt-4">
          <div className="font-display text-2xl sm:text-3xl font-black text-ink tracking-tight truncate">
            {stat.value}
          </div>
        </div>
      </div>

      {/* Card Footer Badge */}
      <div className="mt-5 pt-3 border-t border-line/60 flex items-center">
        {stat.change && (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono-brand ${
              stat.isPositive ? "bg-forest/10 text-forest" : "bg-coral/10 text-coral-deep"
            }`}
          >
            {stat.change}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 3 sa Taas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TOP_STATS.map(renderModernCard)}
      </div>

      {/* 4 sa Baba */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {BOTTOM_STATS.map(renderModernCard)}
      </div>
    </div>
  );
}