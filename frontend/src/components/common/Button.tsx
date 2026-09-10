import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { Link } from "react-router-dom";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "success";
  rounded?:
    | "md"
    | "2xl"
    | "full";
  to?: string;
}

export default function Button({
  children,
  variant = "primary",
  rounded = "md",
  className = "",
  type = "button",
  to,
  ...props
}: ButtonProps) {
  const baseClasses =
    "font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

  const roundedClasses = {
    md: "rounded-md",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  };

  const variantClasses = {
    primary:
      "bg-[var(--color-text)] px-5 py-3 text-[var(--color-background)] hover:opacity-85",

    secondary:
      "border border-[var(--color-border)] bg-transparent px-5 py-3 text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]",

    success:
      "bg-green-700 px-4 py-2 text-sm text-white hover:bg-green-800",
  };

  const classes = `
    ${baseClasses}
    ${roundedClasses[rounded]}
    ${variantClasses[variant]}
    ${className}
  `;

  if (to) {
    return (
      <Link
        to={to}
        className={classes}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}