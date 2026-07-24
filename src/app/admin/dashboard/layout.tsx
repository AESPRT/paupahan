export const dynamic = 'force-dynamic';

import { NavRail } from "@/src/components/admin/navigation/NavRail";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <NavRail />
      <div className="pl-0 transition-all md:pl-[88px]">
        <main className="mx-auto max-w-[1400px]">
          {children}
        </main>
      </div>
    </div>
  );
}