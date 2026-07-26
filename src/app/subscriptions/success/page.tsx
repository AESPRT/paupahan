import PaymentSuccess from "@/src/components/ui/PaymentSuccess";
import FullPageLoader from "@/src/components/ui/FullPageLoader"; // Ayusin ang path kung saan nakalagay ang iyong FullPageLoader
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<FullPageLoader message="Nag-a-load..." />}>
      <PaymentSuccess />
    </Suspense>
  );
}