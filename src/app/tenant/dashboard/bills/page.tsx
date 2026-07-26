"use client";

import { useState, useEffect, useTransition } from "react";
import { TenantBill } from "@/src/types/tenant/tenant-bill";
import { TenantBillsPageHeader } from "@/src/components/tenant/bills/TenantBillsPageHeader";
import { BillCardItem } from "@/src/components/tenant/bills/BillCardItem";
import { BillDetailModal } from "@/src/components/tenant/bills/BillDetailModal";
import { Footer } from "@/src/components/landing/Footer";
import { getTenantBillsData, updateTenantUtilityReadingAction } from "@/src/actions/tenant/tenant-bills-actions";
import { useRouter } from "next/navigation";
import FullPageLoader from "@/src/components/ui/FullPageLoader";

const ITEMS_PER_PAGE = 5; // 👈 5 resibo bawat pahina

export default function TenantBillsPage() {
  const router = useRouter();
  const [bills, setBills] = useState<TenantBill[]>([]);
  const [selectedBill, setSelectedBill] = useState<TenantBill | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // ✨ State para sa Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Load bills galing database sa pagbukas ng page
  useEffect(() => {
    getTenantBillsData().then((res) => {
      if (res.success && res.bills) {
        setBills(res.bills as TenantBill[]);
      } else {
        router.push("/tenant/login");
      }
      setLoading(false);
    });
  }, [router]);

  // Function para sa pag-update ng meter reading at status gamit ang Server Action
  const handleUpdateUtility = (
    billId: string,
    utilityType: "electricity" | "water",
    reading: number,
    photoUrl: string
  ) => {
    startTransition(async () => {
      const result = await updateTenantUtilityReadingAction(billId, utilityType, reading, photoUrl);
      
      if (result.success) {
        // I-refresh ang data mula sa server pagkatapos mag-save
        const res = await getTenantBillsData();
        if (res.success && res.bills) {
          setBills(res.bills as TenantBill[]);
          
          // I-update din ang kasalukuyang nakabukas na modal kung meron man
          const updatedCurrent = res.bills.find((b: { id: string }) => b.id === billId);
          if (updatedCurrent) {
            setSelectedBill(updatedCurrent as TenantBill);
          }
        }
      } else {
        alert(result.error || "Nabigong i-update ang reading.");
      }
    });
  };

  // 🧮 Calculations para sa Pagination
  const totalPages = Math.ceil(bills.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBills = bills.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // I-scroll paitaas nang swabe kapag nag-palit ng pahina
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return <FullPageLoader message="Nag-a-load ng mga resibo..." />;
  }

  return (
    <div className={`space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto ${isPending ? 'opacity-75 transition-opacity' : ''}`}>
      {/* Header */}
      <TenantBillsPageHeader />

      {/* Bills Cards List o Empty State */}
      {bills.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-paper-card p-12 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest/10 text-forest mb-3">
            {/* SVG Icon para sa Walang Resibo */}
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="font-display text-base font-bold text-forest-deep">
            Walang Nakitang Resibo
          </h3>
          <p className="mt-1 max-w-sm text-xs text-muted">
            Wala pang inilalabas na billing statement o invoice ang iyong Landlord sa ngayon.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Ipakita lang ang 5 resibo batay sa kasalukuyang pahina */}
          <div className="space-y-3">
            {paginatedBills.map((bill) => (
              <BillCardItem
                key={bill.id}
                bill={bill}
                onOpenDetails={setSelectedBill}
              />
            ))}
          </div>

          {/* 🎈 Playful Pagination Controls (lalabas lang kapag higit sa 5 ang resibo) */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-line bg-paper-card p-4 shadow-sm transition-all hover:shadow-md">
              {/* Counter Indicator */}
              <div className="flex items-center gap-2 font-mono-brand text-xs font-semibold text-muted">
                <span className="flex h-6 items-center rounded-lg bg-forest/10 px-2 text-forest font-bold">
                  📜 Pahina {currentPage} ng {totalPages}
                </span>
                <span className="text-muted/40">•</span>
                <span>({bills.length} kabuuang resibo)</span>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-1.5">
                {/* Previous Button (SVG Chevron Left) */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-paper text-forest transition-all hover:scale-110 hover:border-forest active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-xs"
                  title="Nakaraang pahina"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Page Number Badges */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`h-9 min-w-9 px-2 rounded-xl font-mono-brand text-xs font-bold transition-all hover:scale-110 active:scale-95 ${
                        currentPage === page
                          ? "bg-forest text-white shadow-md ring-2 ring-forest/30 scale-105"
                          : "border border-line bg-paper text-forest hover:bg-forest/10"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Next Button (SVG Chevron Right) */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-paper text-forest transition-all hover:scale-110 hover:border-forest active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-xs"
                  title="Susunod na pahina"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bill Details Modal */}
      <BillDetailModal
        bill={selectedBill}
        isOpen={!!selectedBill}
        onClose={() => setSelectedBill(null)}
        onUpdateUtility={handleUpdateUtility}
      />

      <Footer showNavLinks={false} />
    </div>
  );
}