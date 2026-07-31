interface StatCardsProps {
  stats?: {
    totalProperties: number;
    totalUnits: number;
    occupiedUnits?: number;
    vacantUnits?: number;
    reservedUnits?: number;
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
    occupiedUnits: 0,
    vacantUnits: 0,
    reservedUnits: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    vacantRooms: 0,
    reservedRooms: 0,
    monthlyRevenue: 0,
    pendingBillsAmount: 0,
    occupancyRate: 0,
  };

  const formattedRevenue = new Intl.NumberFormat("fil-PH", {
    style: "currency",
    currency: "PHP",
  }).format(data.monthlyRevenue);

  const formattedPending = new Intl.NumberFormat("fil-PH", {
    style: "currency",
    currency: "PHP",
  }).format(data.pendingBillsAmount);

  // Computed values kung sakaling opsyonal ang reservedUnits
  const vacantUnits = data.vacantUnits ?? 0;
  const occupiedUnits = data.occupiedUnits ?? 0;
  const reservedUnits = data.reservedUnits ?? 0;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* CARD 1: UNITS OVERVIEW */}
      <div className="relative flex flex-col justify-between rounded-3xl border border-line bg-paper-card p-6 shadow-sm transition-all duration-300 hover:border-forest/30 hover:shadow-md">
        <div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono-brand text-xs font-extrabold uppercase tracking-wider text-muted">
              UNITS OVERVIEW
            </span>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-line bg-paper shadow-sm">
              <svg className="h-5 w-5 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 10V11m4 10V11" />
              </svg>
            </div>
          </div>

          <div className="mt-2">
            <div className="font-display text-3xl font-black text-ink tracking-tight">
              {data.totalUnits} <span className="text-xs font-semibold text-muted">Total Units</span>
            </div>
          </div>
        </div>

        {/* Breakdown ng Units */}
        <div className="mt-4 pt-3 border-t border-line/60 grid grid-cols-3 gap-1 text-center">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono-brand font-bold uppercase text-emerald-600">Avail</span>
            <span className="font-display text-base font-bold text-ink">{vacantUnits}</span>
          </div>
          <div className="flex flex-col border-x border-line/50">
            <span className="text-[10px] font-mono-brand font-bold uppercase text-amber-600">Res</span>
            <span className="font-display text-base font-bold text-ink">{reservedUnits}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono-brand font-bold uppercase text-blue-600">Occ</span>
            <span className="font-display text-base font-bold text-ink">{occupiedUnits}</span>
          </div>
        </div>
      </div>

      {/* CARD 2: BEDS OVERVIEW */}
      <div className="relative flex flex-col justify-between rounded-3xl border border-line bg-paper-card p-6 shadow-sm transition-all duration-300 hover:border-forest/30 hover:shadow-md">
        <div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono-brand text-xs font-extrabold uppercase tracking-wider text-muted">
              BEDS OVERVIEW
            </span>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-line bg-paper shadow-sm">
              <svg className="h-5 w-5 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </div>

          <div className="mt-2">
            <div className="font-display text-3xl font-black text-ink tracking-tight">
              {data.totalRooms} <span className="text-xs font-semibold text-muted">Total Beds</span>
            </div>
          </div>
        </div>

        {/* Breakdown ng Beds */}
        <div className="mt-4 pt-3 border-t border-line/60 grid grid-cols-3 gap-1 text-center">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono-brand font-bold uppercase text-emerald-600">Avail</span>
            <span className="font-display text-base font-bold text-ink">{data.vacantRooms}</span>
          </div>
          <div className="flex flex-col border-x border-line/50">
            <span className="text-[10px] font-mono-brand font-bold uppercase text-amber-600">Res</span>
            <span className="font-display text-base font-bold text-ink">{data.reservedRooms}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono-brand font-bold uppercase text-blue-600">Occ</span>
            <span className="font-display text-base font-bold text-ink">{data.occupiedRooms}</span>
          </div>
        </div>
      </div>

      {/* CARD 3: BUWANANG KITA */}
      <div className="relative flex flex-col justify-between rounded-3xl border border-line bg-paper-card p-6 shadow-sm transition-all duration-300 hover:border-forest/30 hover:shadow-md">
        <div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono-brand text-xs font-extrabold uppercase tracking-wider text-muted">
              BUWANANG KITA
            </span>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-line bg-paper shadow-sm">
              <svg className="h-5 w-5 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="mt-4">
            <div className="font-display text-2xl sm:text-3xl font-black text-ink tracking-tight truncate">
              {formattedRevenue}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-line/60 flex items-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono-brand bg-forest/10 text-forest">
            Koleksyon ngayong buwan
          </span>
        </div>
      </div>

      {/* CARD 4: PENDING BILLS */}
      <div className="relative flex flex-col justify-between rounded-3xl border border-line bg-paper-card p-6 shadow-sm transition-all duration-300 hover:border-forest/30 hover:shadow-md">
        <div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono-brand text-xs font-extrabold uppercase tracking-wider text-muted">
              PENDING BILLS
            </span>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-line bg-paper shadow-sm">
              <svg className="h-5 w-5 text-coral-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          <div className="mt-4">
            <div className="font-display text-2xl sm:text-3xl font-black text-ink tracking-tight truncate">
              {formattedPending}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-line/60 flex items-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono-brand bg-coral/10 text-coral-deep">
            Kailangang singilin
          </span>
        </div>
      </div>
    </div>
  );
}