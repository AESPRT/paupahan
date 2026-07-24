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
      code: "RMS-01"
    },
    { 
      title: "KABUUAN NG UNITS", 
      value: data.totalUnits.toString(), 
      change: "Buildings / Floors", 
      isPositive: true, 
      icon: "units",
      code: "UNT-02"
    },
    { 
      title: "OCCUPIED ROOMS", 
      value: data.occupiedRooms.toString(), 
      change: occupancyRateFormatted, 
      isPositive: true, 
      icon: "occupied",
      code: "OCC-03"
    },
  ];

  const BOTTOM_STATS = [
    { 
      title: "RESERVED ROOMS", 
      value: data.reservedRooms.toString(), 
      change: data.reservedRooms > 0 ? "May naghihintay lumipat" : "Walang naka-reserve", 
      isPositive: true, 
      icon: "reserved",
      code: "RES-04"
    },
    { 
      title: "BAKANTENG ROOMS", 
      value: data.vacantRooms.toString(), 
      change: data.vacantRooms > 0 ? "Kailangan punan" : "Puno na lahat", 
      isPositive: data.vacantRooms === 0, 
      icon: "vacant",
      code: "VAC-05"
    },
    { 
      title: "BUWANANG KITA", 
      value: formattedRevenue, 
      change: "Koleksyon ngayong buwan", 
      isPositive: true, 
      icon: "revenue",
      code: "REV-06"
    },
    { 
      title: "PENDING BILLS", 
      value: formattedPending, 
      change: "Kailangang singilin", 
      isPositive: false, 
      icon: "pending",
      code: "PEN-07"
    },
  ];

  const renderReceiptCard = (stat: typeof TOP_STATS[0]) => (
    <div
      key={stat.title}
      className="perforated relative flex flex-col justify-between rounded-2xl border border-line bg-paper-card p-6 pb-6 shadow-[0_8px_24px_rgba(27,58,52,0.08)] transition-all hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(27,58,52,0.12)]"
    >
      <div>
        {/* Receipt Header Style */}
        <div className="mb-4 flex items-start justify-between border-b-[1.5px] border-dashed border-line pb-3.5">
          <div>
            <div className="font-mono-brand text-[10px] font-bold tracking-wide text-muted">
              STAT REPORT • {stat.code}
            </div>
            <div className="mt-1 font-mono-brand text-xs font-extrabold uppercase tracking-wider text-forest-deep">
              {stat.title}
            </div>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest/10 shadow-sm backdrop-blur-sm">
            {getStatIcon(stat.icon)}
          </div>
        </div>

        {/* Receipt Main Value */}
        <div className="py-2">
          <div className="font-display text-2xl sm:text-3xl font-extrabold text-forest-deep truncate">
            {stat.value}
          </div>
        </div>
      </div>

      {/* Receipt Footer Status */}
      <div className="mt-4 border-t-[1.5px] border-dashed border-line pt-3.5">
        {stat.change && (
          <p
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              stat.isPositive ? "bg-emerald-500/15 text-forest" : "bg-rose-500/15 text-coral-deep"
            }`}
          >
            {stat.change}
          </p>
        )}
      </div>
    </div>
  );

  return (
    // ✨ Pinalitan ang gap sa gap-6 para hindi maging dikit-dikit
    <div className="space-y-6">
      {/* 3 sa Taas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TOP_STATS.map(renderReceiptCard)}
      </div>

      {/* 4 sa Baba */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {BOTTOM_STATS.map(renderReceiptCard)}
      </div>
    </div>
  );
}