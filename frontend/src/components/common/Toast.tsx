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
    error:
      "border-red-200 bg-red-50 text-red-800 " +
      "dark:border-red-900 dark:bg-red-950/50 dark:text-red-200",

    success:
      "border-green-200 bg-green-50 text-green-800 " +
      "dark:border-green-900 dark:bg-green-950/50 dark:text-green-200",

    warning:
      "border-amber-200 bg-amber-50 text-amber-800 " +
      "dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200",

    info:
      "border-blue-200 bg-blue-50 text-blue-800 " +
      "dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200",
  };

  return (
    <div
      role="alert"
      className={`
        fixed bottom-6 right-6 z-50
        flex max-w-sm items-center gap-4
        rounded-md border
        px-4 py-3
        shadow-lg
        ${styles[variant]}
      `}
    >
      <p className="flex-1">
        {message}
      </p>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="
          font-semibold
          opacity-70
          transition-opacity
          hover:opacity-100
        "
      >
        ×
      </button>
    </div>
  );
}