import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { Link } from "react-router-dom";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "tertiary";
  rounded?: "md" | "2xl" | "full";
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
  const baseClasses = `
    inline-flex
    min-h-11
    items-center
    justify-center
    gap-2
    px-5
    py-2.5
    text-sm
    font-medium
    leading-none
    transition-colors
    duration-200
    ease-out
    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-(--color-accent)
    focus-visible:ring-offset-2
    focus-visible:ring-offset-(--color-background)
    disabled:cursor-not-allowed
    disabled:opacity-50
  `;

  const roundedClasses = {
    md: "rounded-(--radius-md)",
    "2xl": "rounded-(--radius-xl)",
    full: "rounded-(--radius-full)",
  };

  const variantClasses = {
    primary: `
      bg-(--color-accent)
      text-(--color-accent-foreground)
      hover:bg-(--color-accent-hover)
    `,

    secondary: `
      border
      border-(--color-border)
      bg-transparent
      text-(--color-text)
      hover:bg-(--color-surface-muted)
    `,

    tertiary: `
      bg-transparent
      text-(--color-text)
      hover:bg-(--color-surface-muted)
    `,
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