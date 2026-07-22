"use client";

interface DashboardHeaderProps {
  adminName?: string;
  onAddAction?: () => void;
}

export function DashboardHeader({
  adminName = "Admin",
  onAddAction,
}: DashboardHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-forest/20 bg-gradient-to-r from-forest via-forest-deep to-forest p-6 text-white shadow-[0_10px_30px_rgba(31,75,63,0.18)] sm:p-8">
      {/* Playful Background Decorative Shapes / Accents */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-marigold/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 right-24 h-36 w-36 rounded-full bg-coral/20 blur-xl" />
      
      {/* Decorative Ticket Notch Accents */}
      <div className="absolute -left-3 top-1/2 h-6 w-3 -translate-y-1/2 rounded-r-full bg-paper" />
      <div className="absolute -right-3 top-1/2 h-6 w-3 -translate-y-1/2 rounded-l-full bg-paper" />

      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Welcome Text Section */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-marigold backdrop-blur-md">
            {/* Sparkles SVG Icon */}
            <svg className="h-3.5 w-3.5 shrink-0 text-marigold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span>Property Management Overview</span>
          </div>
          
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
              Maligayang Pagbabalik, {adminName}!
            </h1>
            {/* Hand Wave SVG Icon */}
            <svg className="h-6 w-6 text-amber-300 animate-bounce shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
            </svg>
          </div>
          
          <p className="max-w-xl text-xs font-medium text-white/80 sm:text-sm">
            Narito ang buod at status ng iyong mga paupahan, koleksyon, at pending approvals ngayong araw.
          </p>
        </div>

        {/* Action Button Section */}
        <div className="shrink-0">
          <button
            onClick={onAddAction}
            className="inline-flex items-center gap-2 rounded-full bg-coral px-5 py-3 font-mono-brand text-xs font-bold text-white shadow-[0_6px_20px_rgba(225,91,78,0.4)] transition-all hover:-translate-y-0.5 hover:bg-coral-deep hover:shadow-[0_8px_25px_rgba(225,91,78,0.5)] active:translate-y-0"
          >
            {/* Plus / Add SVG Icon */}
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Bagong Tenant / Room</span>
          </button>
        </div>
      </div>
    </div>
  );
}