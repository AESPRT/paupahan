import { notFound } from "next/navigation";
import { PaymentView } from "@/src/components/tenant/payment/PaymentView";
import { getBillDetailsForPayment } from "@/src/actions/tenant/tenant-actions";

interface PaymentPageProps {
  params: Promise<{ billId: string }>;
}

export default async function TenantPaymentPage({ params }: PaymentPageProps) {
  const { billId } = await params;

  // Kunin ang totoong detalye ng bill at tenantId mula sa database gamit ang Server Action
  const bill = await getBillDetailsForPayment(billId);

  if (!bill) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-paper px-4 py-6 sm:px-6 lg:px-8">
      <PaymentView
        billId={bill.id}
        tenantId={bill.tenantId}
        monthYear={bill.monthYear}
        totalAmount={bill.totalAmount}
        dueDate={bill.dueDate}
      />
    </main>
  );
}