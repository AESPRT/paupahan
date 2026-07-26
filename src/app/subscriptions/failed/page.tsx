import FullPageLoader from "@/src/components/ui/FullPageLoader";
import PaymentFailed from "@/src/components/ui/PaymentFailed";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<FullPageLoader message="Nag-a-load..." />}>
      <PaymentFailed />
    </Suspense>
  );
}