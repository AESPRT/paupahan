"use client";

import { useNavExpand } from "@/src/components/admin/navigation/NavExpandContext";
import { useEffect, useState } from "react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useNavExpand();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function checkScreenSize() {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint ng Tailwind ay 1024px
    }

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Kapag mobile, ang padding ay 0; kapag desktop, saka lang susunod sa state ng sidebar
  const paddingLeft = isMobile ? "15px" : isExpanded ? "220px" : "88px";

  return (
    <div
      style={{ paddingLeft }}
      className="transition-[padding-left] duration-300 ease-in-out p-4 sm:p-6"
    >
      <main className="mx-auto max-w-[1400px]">
        {children}
      </main>
    </div>
  );
}