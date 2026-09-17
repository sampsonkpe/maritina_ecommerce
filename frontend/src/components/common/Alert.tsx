interface AlertProps {
  message: string;
  variant?: "error" | "success" | "warning";
}

export default function Alert({
  message,
  variant = "error",
}: AlertProps) {
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
  };

  return (
    <div
      role="alert"
      className={`
        rounded-(--radius-md)
        border
        px-4
        py-3
        text-sm
        ${styles[variant]}
      `}
    >
      {message}
    </div>
  );
}