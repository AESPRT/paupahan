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
      {/* May lg:pl-64 para magbigay ng kwalta sa Desktop Sidebar at pb-20 sa Mobile para hindi matakpan ng Bottom Nav */}
      <main className="pb-20 lg:pb-8 lg:pl-64">
        {children}
      </main>
    </div>
  );
}