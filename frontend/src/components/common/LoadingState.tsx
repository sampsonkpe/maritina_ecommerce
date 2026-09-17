import { LoaderCircle } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = "Loading...",
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="
        flex
        min-h-32
        items-center
        justify-center
        gap-3
        py-16
        text-sm
        text-(--color-text-muted)
      "
    >
      <LoaderCircle
        size={18}
        strokeWidth={1.8}
        className="animate-spin"
        aria-hidden="true"
      />

      <span>{message}</span>
    </div>
  );
}