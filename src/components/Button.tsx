import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost";
    href?: string;
    children: ReactNode;
    className?: string;
}

export function Button({
    variant = "primary",
    href,
    children,
    className = "",
    ...props
}: ButtonProps) {
    // Mga base styles para sa button
    const baseStyles =
        "inline-flex items-center justify-center font-display font-semibold transition-all duration-200 rounded-xl focus-visible:outline focus-visible:outline-3 focus-visible:outline-marigold-deep cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

    // Mga variant styles batay sa design system
    const variantStyles = {
        primary:
            "bg-forest-deep text-paper hover:bg-forest shadow-[0_4px_12px_rgba(21,55,48,0.15)] active:scale-[0.98]",
        secondary:
            "border-[1.5px] border-line bg-paper-card text-forest-deep hover:border-forest-deep hover:bg-forest/[0.02]",
        ghost:
            "text-forest-deep hover:bg-forest/[0.06] active:bg-forest/[0.1]",
    };

    const defaultSizes = "px-6 py-3 text-base sm:text-[15px]";

    const combinedClasses = `${baseStyles} ${variantStyles[variant]} ${defaultSizes} ${className}`;

    // Kung may ibinigay na href, gamitin ang Next.js Link
    if (href) {
        return (
            <Link href={href} className={combinedClasses}>
                {children}
            </Link>
        );
    }

    // Kung wala, mag-render bilang regular HTML button
    return (
        <button className={combinedClasses} {...props}>
            {children}
        </button>
    );
}