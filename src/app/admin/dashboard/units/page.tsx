import { getUnitsData } from "@/src/actions/units-actions";
import UnitsClientWrapper from "@/src/components/admin/units/UnitsClientWrapper"; // O kaya ay ilagay sa ibaba ang client wrapper

export const dynamic = 'force-dynamic';

export default async function UnitsPage() {
  const units = await getUnitsData();

  return (
    <UnitsClientWrapper 
      initialUnits={units}
    />
  );
}