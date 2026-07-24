import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "success";
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const baseClasses =
    "rounded-md font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

  const variantClasses = {
    primary:
      "bg-black px-5 py-3 text-white hover:bg-gray-800",

    secondary:
      "border px-5 py-3 hover:bg-gray-100",

    success:
      "bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700",
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}