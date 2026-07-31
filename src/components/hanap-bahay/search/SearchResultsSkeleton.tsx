// src/components/hanap-bahay/SearchResultsSkeleton.tsx
import { PropertySkeleton } from "@/src/components/hanap-bahay/PropertySkeleton";

export function SearchResultsSkeleton() {
  return (
    <section
      className="relative z-10 py-16 lg:py-24"
      style={{ backgroundColor: "var(--paper)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--marigold-deep)] mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--marigold)] animate-pulse" />
            Mga Paupahan
          </div>
          <div className="h-px w-full bg-[var(--line)]" />
        </div>

        {/* Results header row */}
        <div className="flex items-center justify-between mt-6 mb-6">
          <div className="h-4 w-32 rounded-full bg-[var(--line)] animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[var(--line)] animate-pulse lg:hidden" />
            <div className="h-9 w-36 rounded-full bg-[var(--line)] animate-pulse" />
          </div>
        </div>

        <div className="flex gap-6 lg:gap-8 items-start">
          {/* Sidebar skeleton — desktop only, matches sticky filter panel */}
          <aside
            className="hidden lg:block w-64 xl:w-72 flex-shrink-0"
            aria-hidden="true"
          >
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper-card)] shadow-sm overflow-hidden p-5 space-y-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="space-y-2.5">
                  <div className="h-3 w-20 rounded-full bg-[var(--line)] animate-pulse" />
                  <div className="h-9 w-full rounded-xl bg-[var(--line)]/70 animate-pulse" />
                </div>
              ))}
            </div>
          </aside>

          {/* Card grid skeleton */}
          <div className="flex-1 min-w-0">
            <div className="h-3 w-40 rounded-full bg-[var(--line)] animate-pulse mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <PropertySkeleton key={n} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
