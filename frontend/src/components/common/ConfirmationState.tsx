import { CircleCheckBig } from "lucide-react";

interface ConfirmationStateProps {
  title: string;
  message?: string;
}

export default function ConfirmationState({
  title,
  message,
}: ConfirmationStateProps) {
  return (
    <div
      role="status"
      className="
        flex
        min-h-40
        flex-col
        items-center
        justify-center
        rounded-(--radius-md)
        border
        border-(--color-success)
        bg-(--color-success-surface)
        p-8
        text-center
        text-(--color-success)
      "
    >
      <CircleCheckBig
        size={22}
        strokeWidth={1.8}
        aria-hidden="true"
      />

      <h2 className="mt-3 text-sm font-semibold">
        {title}
      </h2>

      {message && (
        <p className="mt-1 max-w-md text-sm">
          {message}
        </p>
      )}
    </div>
  );
}