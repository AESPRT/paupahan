import Link from "next/link";
import { ReactNode, MouseEvent } from "react";

type Variant = "primary" | "ghost";

export function Button({
  href,
  variant = "primary",
  block = false,
  className = "",
  children,
  onClick,
  type = "button",
  disabled = false, // 👈 Idagdag ito
}: {
  href?: string;
  variant?: Variant;
  block?: boolean;
  className?: string;
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean; // 👈 Idagdag sa TypeScript definition
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-bold text-[15.5px] px-6 py-3.5 border-2 transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-3 focus-visible:outline-marigold-deep focus-visible:outline-offset-2 disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:translate-y-0";

  const variants: Record<Variant, string> = {
    primary:
      "bg-coral text-white border-transparent shadow-[0_8px_20px_rgba(225,91,78,0.35)] hover:shadow-[0_12px_26px_rgba(225,91,78,0.42)]",
    ghost:
      "bg-transparent border-forest text-forest-deep hover:bg-forest/[0.06]",
  };

  const combinedClassName = `${base} ${variants[variant]} ${block ? "w-full" : ""} ${className}`;

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={combinedClassName} type={type} disabled={disabled}>
      {children}
    </button>
  );
}