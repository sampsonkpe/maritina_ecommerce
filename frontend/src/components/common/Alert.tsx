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
      "border-red-200 bg-red-50 text-red-700",

    success:
      "border-green-200 bg-green-50 text-green-700",

    warning:
      "border-yellow-200 bg-yellow-50 text-yellow-700",
  };

  return (
    <div
      className={`rounded-md border px-4 py-3 ${styles[variant]}`}
    >
      {message}
    </div>
  );
}