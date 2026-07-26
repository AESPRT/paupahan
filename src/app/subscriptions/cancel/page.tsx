import FullPageLoader from "@/src/components/ui/FullPageLoader";
import PaymentCancel from "@/src/components/ui/PaymentCancel";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<FullPageLoader message="Nag-a-load..." />}>
      <PaymentCancel />
    </Suspense>
  );
}