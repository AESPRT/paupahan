import Link from "next/link";
import { ReactNode } from "react";

type Variant = "primary" | "ghost";

export function Button({
  href,
  variant = "primary",
  block = false,
  className = "",
  children,
  onClick,
}: {
  href: string;
  variant?: Variant;
  block?: boolean;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-bold text-[15.5px] px-6 py-3.5 border-2 transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-3 focus-visible:outline-marigold-deep focus-visible:outline-offset-2";

  const variants: Record<Variant, string> = {
    primary:
      "bg-coral text-white border-transparent shadow-[0_8px_20px_rgba(225,91,78,0.35)] hover:shadow-[0_12px_26px_rgba(225,91,78,0.42)]",
    ghost:
      "bg-transparent border-forest text-forest-deep hover:bg-forest/[0.06]",
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${block ? "w-full" : ""} ${className}`}
    >
      {children}
    </Link>
  );
}
