// src/components/hanap-bahay/LatestPropertiesGrid.tsx
import { Property } from "@/src/types/property";
import { PropertyCard } from "@/src/components/hanap-bahay/PropertyCard";
import { ArrowRight } from "lucide-react";

interface LatestPropertiesGridProps {
  properties: Property[];
  onViewDetails: (property: Property) => void;
  onViewAll: () => void;
}

export function LatestPropertiesGrid({ properties, onViewDetails, onViewAll }: LatestPropertiesGridProps) {
  if (properties.length === 0) return null;

  return (
    <section className="py-24 sm:py-32 bg-white/40 backdrop-blur-sm border-t border-[var(--forest-deep)]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--forest-deep)]/15 bg-[var(--forest-deep)]/5 mb-4">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--forest-deep)]">
                Mga Bagong Salta
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-[var(--ink)] leading-tight tracking-tight">
                Kamakailang{" "}
                <span className="relative inline-block">
                Listahan
                <svg
                    aria-hidden="true"
                    className="absolute -bottom-1.5 left-0 w-full"
                    viewBox="0 0 200 8"
                    fill="none"
                    preserveAspectRatio="none"
                >
                    <path
                    d="M0 6 Q25 1 50 5 Q75 9 100 4 Q125 -1 150 5 Q175 9 200 4"
                    stroke="var(--marigold)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    />
                </svg>
                </span>
            </h2>
            <p className="font-body text-sm sm:text-base text-[var(--forest-deep)]/60 mt-2">
              Silipin ang mga bagong bakanteng unit na kakatapos lang i-post.
            </p>
          </div>

          <button 
            onClick={onViewAll}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl border border-[var(--forest-deep)]/15 bg-white text-xs sm:text-sm font-extrabold text-[var(--forest-deep)] hover:bg-[var(--forest-deep)] hover:text-white shadow-sm hover:shadow-md transition-all duration-300 self-start md:self-auto"
          >
            <span>Tingnan ang lahat ng listahan</span>
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>

        {/* ── Properties Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {properties.map((property) => (
            <div 
              key={property.id} 
              className="transform hover:-translate-y-1 transition-transform duration-300"
            >
              <PropertyCard
                property={property}
                onViewDetails={onViewDetails}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}