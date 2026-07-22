export function UtilityHeader() {
  return (
    <div className="border-b border-line pb-4">
      <div className="flex items-center gap-2.5">
        {/* Energy / Utility SVG Icon */}
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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>

        <h1 className="font-display text-xl font-bold text-forest-deep sm:text-2xl">
          Utility Rates & Fixed Amenities
        </h1>
      </div>

      <p className="mt-1 text-xs text-muted">
        Suriin ang pinakabagong presyo ng kuryente, tubig, at iba pang amenities na nakatakda sa iyong kontrata.
      </p>
    </div>
  );
}