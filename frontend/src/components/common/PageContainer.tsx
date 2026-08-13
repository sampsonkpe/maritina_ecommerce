import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: "5xl" | "6xl";
  className?: string;
}

export default function PageContainer({
  children,
  maxWidth = "5xl",
  className = "",
}: PageContainerProps) {
  return (
    <div
      className={`mx-auto p-8 ${
        maxWidth === "6xl"
          ? "max-w-6xl"
          : "max-w-5xl"
      } ${className}`}
    >
      {children}
    </div>
  );
}