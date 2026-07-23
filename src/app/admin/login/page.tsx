import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthFooter } from "@/src/components/auth/AuthFooter";
import { AdminLoginCard } from "@/src/components/admin/login/AdminLoginCard";

export const metadata = {
  title: "Admin Login | Paupahan",
  description: "Mag-login sa iyong Paupahan admin account para pamahalaan ang iyong mga bahay-paupahan at tenant.",
};

export default async function AdminLoginPage() {
  // Suriin kung ang user ay mayroon nang aktibong sesyon (cookie)
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;

  // Kung naka-login na, huwag nang ipakita ang login page—dumiretso agad sa dashboard
  if (sessionUserId) {
    redirect("/admin/dashboard/home");
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-paper px-4 py-8 sm:px-6 lg:px-8">
      <main className="my-auto py-8">
        <AdminLoginCard />
      </main>

      <AuthFooter />
    </div>
  );
}