import { cookies } from "next/headers";
import prisma from "@/src/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileClientView } from "@/src/components/admin/profile/ProfileClientView";
import { AdminProfileData } from "@/src/types/admin/profile";
import { logoutUser } from "@/src/actions/auth-actions";
import { getUserAuditLogs } from "@/src/actions/audit-actions"; // ✨ Import ang audit log action

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;

  if (!userId) {
    redirect("/admin/login");
  }

  // Kunin ang totoong impormasyon ng user mula sa database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      properties: true,
    },
  });

  if (!user) {
    redirect("/admin/login");
  }

  const managedPropertiesCount = user.properties.length;
  
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
    totalRoomsCount: 0,
    activeTenantsCount: 0,
  };

  // 🌟 Kunin na ang totoong dynamic logs mula sa database gamit ang user id
  const logs = await getUserAuditLogs(user.id);

  return (
    <ProfileClientView
      profileData={profileData}
      mockLogs={logs} // Ipasa ang totoong logs sa client view
      onConfirmLogout={logoutUser}
    />
  );
}