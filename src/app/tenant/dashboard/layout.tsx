export const dynamic = 'force-dynamic';

import { TenantNavigationRail } from "@/src/components/tenant/navigation/TenantNavigationRail";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Navigation Rail / Mobile Nav Bar */}
      <TenantNavigationRail />

      {/* Main Page Content Wrapper */}
      <main className="pb-20 lg:pb-8 lg:pl-64">
        {children}
      </main>
    </div>
  );
}