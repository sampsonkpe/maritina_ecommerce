interface ToastProps {
  message: string;
  variant: "error" | "success" | "warning" | "info";
  onClose: () => void;
}

export default function Toast({
  message,
  variant,
  onClose,
}: ToastProps) {
  const styles = {
    error:
      "border-red-200 bg-red-50 text-red-700",

    success:
      "border-green-200 bg-green-50 text-green-700",

    warning:
      "border-yellow-200 bg-yellow-50 text-yellow-700",

    info:
      "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <div
      role="alert"
      className={`fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-4 rounded-md border px-4 py-3 shadow-lg ${styles[variant]}`}
    >
      <p className="flex-1">
        {message}
      </p>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="font-semibold opacity-70 transition hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}