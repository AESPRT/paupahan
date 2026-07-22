import { AuthHeader } from "@/src/components/auth/AuthHeader";
import { AuthFooter } from "@/src/components/auth/AuthFooter";
import { ForgotPasswordCard } from "@/src/components/forgot-password/ForgotPasswordCard";

export const metadata = {
  title: "Nakalimutan ang Password | Paupahan",
  description: "I-reset ang password ng iyong Paupahan account.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-paper px-4 py-8 sm:px-6 lg:px-8">
      <main className="my-auto py-8">
        <ForgotPasswordCard />
      </main>

      <AuthFooter />
    </div>
  );
}