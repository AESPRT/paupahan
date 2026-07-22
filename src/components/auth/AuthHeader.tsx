import Link from "next/link";

interface AuthHeaderProps {
  backHref?: string;
  backLabel?: string;
}

export function AuthHeader({
  backHref = "/",
  backLabel = "← Bumalik sa Home",
}: AuthHeaderProps) {
  return (
    <header className="mx-auto w-full max-w-[420px] flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2.5 font-display text-[22px] font-extrabold text-forest-deep">
        <span className="flex h-[34px] w-[34px] -rotate-3 items-center justify-center rounded-[9px] bg-forest font-mono-brand text-[16px] font-semibold text-marigold">
          P
        </span>
        Paupahan
      </Link>
      <Link href={backHref} className="text-sm font-semibold text-muted transition-colors hover:text-forest-deep">
        {backLabel}
      </Link>
    </header>
  );
}
