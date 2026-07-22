export function TenantBillsPageHeader() {
  return (
    <div className="border-b border-line pb-4">
      <div className="flex items-center gap-2.5">
        {/* Receipt / Invoice SVG Icon */}
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest/10 text-forest sm:h-9 sm:w-9 shrink-0">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        <h1 className="font-display text-xl font-bold text-forest-deep sm:text-2xl">
          Aking mga Bills & Billing Statement
        </h1>
      </div>

      <p className="mt-1 text-xs text-muted">
        Suriin ang iyong buwanang upa at mag-input ng meter reading para sa kuryente at tubig.
      </p>
    </div>
  );
}