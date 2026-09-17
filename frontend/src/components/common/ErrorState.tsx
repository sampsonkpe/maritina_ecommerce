import { CircleAlert } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
}

export default function ErrorState({
  title = "Something went wrong.",
  message,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="
        flex
        min-h-40
        flex-col
        items-center
        justify-center
        rounded-(--radius-md)
        border
        border-(--color-error)
        bg-(--color-error-surface)
        p-8
        text-center
        text-(--color-error)
      "
    >
      <CircleAlert
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