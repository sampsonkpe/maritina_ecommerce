import { X } from "lucide-react";

interface ToastProps {
  message: string;
  variant:
    | "error"
    | "success"
    | "warning"
    | "info";
  onClose: () => void;
}

export default function Toast({
  message,
  variant,
  onClose,
}: ToastProps) {
  const styles = {
    error: `
      border-(--color-error)
      bg-(--color-error-surface)
      text-(--color-error)
    `,
    success: `
      border-(--color-success)
      bg-(--color-success-surface)
      text-(--color-success)
    `,
    warning: `
      border-(--color-warning)
      bg-(--color-warning-surface)
      text-(--color-warning)
    `,
    info: `
      border-(--color-info)
      bg-(--color-info-surface)
      text-(--color-info)
    `,
  };

  return (
    <div
      role="alert"
      className={`
        fixed
        bottom-6
        right-6
        z-50
        flex
        max-w-sm
        items-center
        gap-4
        rounded-(--radius-md)
        border
        px-4
        py-3
        shadow-lg
        ${styles[variant]}
      `}
    >
      <p className="flex-1 text-sm">
        {message}
      </p>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="
          shrink-0
          rounded-sm
          p-1
          opacity-70
          transition-opacity
          duration-200
          hover:opacity-100
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-current
          focus-visible:ring-offset-1
          focus-visible:ring-offset-(--color-background)
        "
      >
        <X
          size={18}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}