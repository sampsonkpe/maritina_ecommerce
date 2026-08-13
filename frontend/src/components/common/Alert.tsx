interface AlertProps {
  message: string;
  variant?: "error" | "success" | "warning";
}

export default function Alert({
  message,
  variant = "error",
}: AlertProps) {
  const styles = {
    error:
      "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200",

    success:
      "border-green-300 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200",

    warning:
      "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  };

  return (
    <div
      className={`rounded-md border px-4 py-3 ${styles[variant]}`}
    >
      {message}
    </div>
  );
}