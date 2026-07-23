import { TenantUtilitiesData } from "@/src/types/tenant/tenant-utilities";

export const MOCK_UTILITIES_DATA: TenantUtilitiesData = {
  rates: [
    {
      id: "rate-elec",
      name: "Kuryente (Submeter Rate)",
      type: "electricity",
      unit: "kWh",
      ratePerUnit: 12.5,
      lastUpdated: "Hulyo 1, 2026",
      description: "Batay sa Meralco residential rate na itinakda para sa apartment submeter.",
    },
    {
      id: "rate-water",
      name: "Tubig (Submeter Rate)",
      type: "water",
      unit: "m³",
      ratePerUnit: 45.0,
      lastUpdated: "Hulyo 1, 2026",
      description: "Kalkulado ayon sa Maynilad / Manila Water billing bracket.",
    },
  ],
  amenities: [
    {
      id: "amenity-garbage",
      name: "Garbage Collection & Sanitation",
      amount: 100.0,
      billingType: "Fixed Monthly",
      description: "Koleksyon ng basura tuwing Lunes at Huwebes.",
      isIncluded: true,
    },
    {
      id: "amenity-wifi",
      name: "Shared Fiber Wi-Fi (100 Mbps)",
      amount: 250.0,
      billingType: "Fixed Monthly",
      description: "Mabilis na pampublikong Wi-Fi sa bawat palapag.",
      isIncluded: true,
    },
    {
      id: "amenity-parking",
      name: "Motorcycle Parking Slot",
      amount: 300.0,
      billingType: "Optional / Add-on",
      description: "Nakatalagang slot sa paradahan ng motor sa ground floor.",
      isIncluded: false,
    },
  ],
};