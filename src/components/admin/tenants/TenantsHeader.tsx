"use client";

interface TenantsHeaderProps {
  totalTenants: number;
  activeCount: number;
  overdueCount: number;
  onAddTenant: () => void;
}

export function TenantsHeader({
  totalTenants,
  activeCount,
  overdueCount,
  onAddTenant,
}: TenantsHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl border border-forest/20 bg-gradient-to-r from-forest via-forest-deep to-forest p-6 text-white shadow-md sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-marigold/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 right-20 h-32 w-32 rounded-full bg-coral/20 blur-xl" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-marigold backdrop-blur-md">
              {/* Users / Tenants SVG Icon */}
              <svg className="h-3.5 w-3.5 shrink-0 text-marigold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Tenant Management</span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-black sm:text-3xl lg:text-4xl">
              Mga Tenant at Sakop na Kwarto
            </h1>
            <p className="mt-1 text-xs text-white/80 sm:text-sm">
              Pamahalaan ang mga nangungupahan, kontrata, at status ng bayarin.
            </p>
          </div>

          {/* Button Container (Full width sa mobile, nakasentro ang icon at text sa loob) */}
          <div className="flex w-full sm:w-auto sm:justify-end">
            <button
              onClick={onAddTenant}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-coral px-5 py-3 font-mono-brand text-xs font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-coral-deep active:translate-y-0 sm:w-auto"
            >
              {/* Plus / Add SVG Icon */}
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Magdagdag ng Tenant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Tenant Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-paper-card p-4 shadow-sm">
          <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            Kabuuan ng Tenant
          </span>
          <div className="mt-1 font-display text-2xl font-bold text-forest-deep">
            {totalTenants}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-paper-card p-4 shadow-sm">
          <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            Aktibong Nangungupahan
          </span>
          <div className="mt-1 font-display text-2xl font-bold text-forest">
            {activeCount}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-paper-card p-4 shadow-sm">
          <span className="font-mono-brand text-[11px] font-bold uppercase tracking-wider text-muted">
            May Overdue sa Bayad
          </span>
          <div className="mt-1 font-display text-2xl font-bold text-coral-deep">
            {overdueCount}
          </div>
        </div>
      </div>
    </div>
  );
}