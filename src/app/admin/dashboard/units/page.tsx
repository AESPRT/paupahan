import { getUnitsData } from "@/src/actions/units-actions";
import UnitsClientWrapper from "@/src/components/admin/units/UnitsClientWrapper"; // O kaya ay ilagay sa ibaba ang client wrapper

export const dynamic = 'force-dynamic';

export default async function UnitsPage() {
  const units = await getUnitsData();

  // Calculations for Stats galing sa Database
  const totalUnits = units.length;
  const allRooms = units.flatMap((u) => u.rooms);
  const totalRooms = allRooms.length;
  const vacantRooms = allRooms.filter((r) => r.status === "Vacant").length;

  return (
    <UnitsClientWrapper 
      initialUnits={units}
      totalUnits={totalUnits}
      totalRooms={totalRooms}
      vacantRooms={vacantRooms}
    />
  );
}