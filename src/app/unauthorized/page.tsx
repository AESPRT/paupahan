import { AuthFooter } from "@/src/components/auth/AuthFooter";
import { UnauthorizedCard } from "@/src/components/unauthorized/UnauthorizedCard";

export const metadata = {
  title: "Bawal Pumasok! | Paupahan",
  description: "Wala kang sapat na permiso para ma-access ang pahinang ito.",
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-paper px-4 py-8 sm:px-6 lg:px-8">
      <main className="my-auto py-8">
        <UnauthorizedCard />
      </main>

      <AuthFooter />
    </div>
  );
}