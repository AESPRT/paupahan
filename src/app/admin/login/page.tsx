import { AuthHeader } from "@/src/components/auth/AuthHeader";
import { AuthFooter } from "@/src/components/auth/AuthFooter";
import { AdminLoginCard } from "@/src/components/admin/login/AdminLoginCard";

export const metadata = {
  title: "Admin Login | Paupahan",
  description: "Mag-login sa iyong Paupahan admin account para pamahalaan ang iyong mga bahay-paupahan at tenant.",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-paper px-4 py-8 sm:px-6 lg:px-8">
      <main className="my-auto py-8">
        <AdminLoginCard />
      </main>

      <AuthFooter />
    </div>
  );
}
