export function MaintenanceHeader() {
  return (
    <div className="border-b border-line pb-4">
      <div className="flex items-center gap-2.5">
        {/* Maintenance / Repair Tools SVG Icon */}
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest/10 text-forest sm:h-9 sm:w-9">
          <svg
            className="h-5 w-5 sm:h-5 sm:w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <h1 className="font-display text-xl font-bold text-forest-deep sm:text-2xl">
          Maintenance & Repair Requests
        </h1>
      </div>

      <p className="mt-1 text-xs text-muted">
        Mag-report ng mga sirang gamit o kailangang ayusin sa iyong kuwarto para mabilis na maaksyunan ng landlord.
      </p>
    </div>
  );
}