export const dynamic = 'force-dynamic';

import { TenantNavigationRail } from "@/src/components/tenant/navigation/TenantNavigationRail";
import { checkTenantHasPendingBillsAction } from "@/src/actions/tenant/tenant-bills-actions";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✨ Kunin sa database kung may pending bills o draft ang tenant
  const result = await checkTenantHasPendingBillsAction();
  const hasPendingBills = result.success ? result.hasPending : false;

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Navigation Rail / Mobile Nav Bar kasama ang pending status prop */}
      <TenantNavigationRail hasPendingBills={hasPendingBills} />

      {/* Main Page Content Wrapper */}
      <main className="pb-20 lg:pb-8 lg:pl-64">
        {children}
      </main>
    </div>
  );
}