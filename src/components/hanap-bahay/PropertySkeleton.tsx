// ==========================================
// 9. LOADING SKELETON (components/hanap-bahay/PropertySkeleton.tsx)
// ==========================================
export function PropertySkeleton() {
    return (
        <div className="flex flex-col overflow-hidden rounded-3xl border border-[#E4DDC9] bg-white shadow-sm animate-pulse">
            <div className="h-64 w-full bg-[#E4DDC9]/50" />
            <div className="p-5 space-y-3">
                <div className="h-6 w-3/4 rounded-lg bg-[#E4DDC9]/50" />
                <div className="h-4 w-1/2 rounded-lg bg-[#E4DDC9]/40" />
                <div className="h-10 w-full rounded-lg bg-[#E4DDC9]/30" />
                <div className="flex items-center justify-between pt-4 border-t border-[#E4DDC9]">
                    <div className="h-6 w-1/3 rounded-lg bg-[#E4DDC9]/50" />
                    <div className="h-8 w-1/4 rounded-xl bg-[#E4DDC9]/50" />
                </div>
            </div>
        </div>
    );
}