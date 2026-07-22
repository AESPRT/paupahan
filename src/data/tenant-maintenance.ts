import { MaintenanceTicket } from "@/src/types/tenant-maintenance";

export const MOCK_MAINTENANCE_TICKETS: MaintenanceTicket[] = [
  {
    id: "MNT-2026-001",
    title: "Tumatagas na gripo sa banyo",
    category: "Plumbing",
    priority: "Medium",
    status: "In Progress",
    description: "Malakas ang patak ng tubig sa ilalim ng sink ng banyo kahit nakasara na nang mahigpit.",
    photoUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400",
    createdAt: "Hulyo 20, 2026",
    adminRemark: "Pumunta na ang tubero para tingnan ang gasket. Papaltan bukas ng umaga.",
  },
  {
    id: "MNT-2026-002",
    title: "Pundi na ilaw sa kusina",
    category: "Electrical",
    priority: "Low",
    status: "Resolved",
    description: "Ayaw na gumana ng LED bulb sa ibabaw ng counter top.",
    createdAt: "Hulyo 10, 2026",
    updatedAt: "Hulyo 11, 2026",
    adminRemark: "Napalitan na ng bagong bulb ng caretaker.",
  },
];