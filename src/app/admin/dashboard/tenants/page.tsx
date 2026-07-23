import { getTenantsData } from "@/src/actions/tenants-actions";
import TenantsClientWrapper from "@/src/components/admin/tenants/TenantsClientWrapper";

export const dynamic = 'force-dynamic';

export default async function TenantsPage() {
  const tenants = await getTenantsData();

  return <TenantsClientWrapper initialTenants={tenants} />;
}