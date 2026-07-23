"use client";

export function TenantSettingsHeader() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-forest/20 bg-gradient-to-r from-forest via-forest-deep to-forest p-6 text-white shadow-sm sm:p-8">
      {/* Decorative Blur Backgrounds */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-marigold/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 right-24 h-36 w-36 rounded-full bg-coral/20 blur-xl" />

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-marigold backdrop-blur-md">
            {/* Settings Gear SVG Icon */}
            <svg className="h-3.5 w-3.5 shrink-0 text-marigold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Account Settings</span>
          </div>

          <h1 className="font-display text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
            Mga Setting at Profile
          </h1>

          <p className="max-w-xl text-xs font-medium text-white/80 sm:text-sm">
            I-update ang iyong impormasyon sa pakikipag-ugnayan, password, at mga abiso.
          </p>
        </div>
      </div>
    </div>
  );
}