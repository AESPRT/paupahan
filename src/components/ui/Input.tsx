import React, { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, rightElement, id, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            className="block text-xs font-mono-brand font-semibold uppercase tracking-wider text-forest-deep"
          >
            {label}
          </label>
          {rightElement}
        </div>
        <input
          id={id}
          ref={ref}
          className={`mt-1.5 w-full rounded-xl border bg-paper px-4 py-3 text-sm font-medium text-ink placeholder:text-muted/60 transition-colors focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 ${
            error ? "border-coral text-coral-deep" : "border-line"
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-coral-deep">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
