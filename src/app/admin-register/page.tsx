import { AuthHeader } from "@/src/components/auth/AuthHeader";
import { AuthFooter } from "@/src/components/auth/AuthFooter";
import { AdminRegisterCard } from "@/src/components/admin-register/AdminRegisterCard";

export const metadata = {
  title: "Mag-register | Paupahan",
  description: "Lumikha ng libreng Paupahan admin account para sa iyong mga bahay-paupahan.",
};

export default function AdminRegisterPage() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-paper px-4 py-8 sm:px-6 lg:px-8">
      <AuthHeader backHref="/" backLabel="← Bumalik sa Home" />
      
      <main className="my-auto py-8">
        <AdminRegisterCard />
      </main>

      <AuthFooter />
    </div>
  );
}
