// app/hanap-bahay/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/src/components/hanap-bahay/Navbar";

export default function HanapBahayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/hanap-bahay";

  return (
    <>
      <Navbar />
      {/* Home keeps the hero full-bleed under the transparent navbar.
          Other pages (e.g. /search) need top padding so content
          doesn't start underneath the fixed header. */}
      <main className={isHome ? "" : "pt-16 lg:pt-20"}>{children}</main>
    </>
  );
}
