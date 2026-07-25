import { cookies } from "next/headers";
import prisma from "@/src/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileClientView } from "@/src/components/admin/profile/ProfileClientView";
import { AdminProfileData } from "@/src/types/admin/profile";
import { logoutUser } from "@/src/actions/auth-actions";
import { getUserAuditLogs } from "@/src/actions/audit-actions";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;

  if (!userId) {
    redirect("/admin/login");
  }

  // Kunin ang user pati na ang mga properties at mga unit/rooms nito
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      properties: {
        include: {
          units: {
            include: {
              rooms: {
                include: {
                  leases: {
                    where: { status: "active" },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/admin/login");
  }

  const managedPropertiesCount = user.properties.length;

  // ✨ Kalkulahin ang total rooms at active tenants mula sa mga property ng landlord na ito
  let totalRoomsCount = 0;
  let activeTenantsCount = 0;

  user.properties.forEach((property) => {
    property.units.forEach((unit) => {
      totalRoomsCount += unit.rooms.length;
      unit.rooms.forEach((room) => {
        // Kung ang kwarto ay may active lease, ibig sabihin ay may active tenant ito
        if (room.leases && room.leases.length > 0) {
          activeTenantsCount += room.leases.length;
        }
      });
    });
  });
  
  const joinedDate = new Intl.DateTimeFormat("fil-PH", {
    month: "long",
    year: "numeric",
  }).format(user.createdAt);

  const profileData: AdminProfileData = {
    id: user.id,
    fullName: user.fullName,
    role: user.role === "landlord" ? "Main Landlord & Property Owner" : "Administrator",
    email: user.email,
    phone: user.phone || "Walang numero",
    joinedDate: joinedDate,
    managedPropertiesCount: managedPropertiesCount,
    totalRoomsCount: totalRoomsCount,       // ✨ Dynamic na total rooms
    activeTenantsCount: activeTenantsCount, // ✨ Dynamic na active tenants
  };

  // Kunin ang totoong dynamic logs mula sa database gamit ang user id
  const logs = await getUserAuditLogs(user.id);

  return (
    <ProfileClientView
      profileData={profileData}
      mockLogs={logs}
      onConfirmLogout={logoutUser}
    />
  );
}