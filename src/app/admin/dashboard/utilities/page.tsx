import { UtilitiesClientWrapper } from "@/src/components/admin/utilities/UtilitiesClientWrapper"; // 👈 Client wrapper para sa interactive states
import { Footer } from "@/src/components/landing/Footer";
import { getUtilitiesData } from "@/src/actions/utilities-actions";

export default async function UtilitiesPage() {
  // Direktang kinukuha sa server ang data nang walang useEffect!
  const data = await getUtilitiesData();

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Interactive Client Component na may dalang initial data */}
      <UtilitiesClientWrapper 
        initialRates={data.rates} 
        initialAmenities={data.amenities} 
      />

      <Footer showNavLinks={false} />
    </div>
  );
}