"use client";

import { useState, useEffect, useTransition } from "react";
import { TenantBill } from "@/src/types/tenant/tenant-bill";
import { TenantBillsPageHeader } from "@/src/components/tenant/bills/TenantBillsPageHeader";
import { BillCardItem } from "@/src/components/tenant/bills/BillCardItem";
import { BillDetailModal } from "@/src/components/tenant/bills/BillDetailModal";
import { Footer } from "@/src/components/landing/Footer";
import { getTenantBillsData, updateTenantUtilityReadingAction } from "@/src/actions/tenant/tenant-bills-actions";
import { useRouter } from "next/navigation";

export default function TenantBillsPage() {
  const router = useRouter();
  const [bills, setBills] = useState<TenantBill[]>([]);
  const [selectedBill, setSelectedBill] = useState<TenantBill | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-forest border-t-transparent" />
          <span className="text-xs font-bold text-muted uppercase tracking-wider">Nag-a-load ng mga resibo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto ${isPending ? 'opacity-75 transition-opacity' : ''}`}>
      {/* Header */}
      <TenantBillsPageHeader />

      {/* Bills Cards List o Empty State */}
      {bills.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-paper-card p-12 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest/10 text-forest mb-3">
            📄
          </div>
          <h3 className="font-display text-base font-bold text-forest-deep">
            Walang Nakitang Resibo
          </h3>
          <p className="mt-1 max-w-sm text-xs text-muted">
            Wala pang inilalabas na billing statement o invoice ang iyong Landlord sa ngayon.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bills.map((bill) => (
            <BillCardItem
              key={bill.id}
              bill={bill}
              onOpenDetails={setSelectedBill}
            />
          ))}
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