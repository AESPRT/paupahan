import { Suspense } from "react";
import { SearchPageClient } from "@/src/components/hanap-bahay/search/SearchPageClient";
import { SearchResultsSkeleton } from "@/src/components/hanap-bahay/search/SearchResultsSkeleton";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#FAF7EF] text-[#153730]">
      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchPageClient />
      </Suspense>
    </div>
  );
}
