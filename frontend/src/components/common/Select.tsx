import type { SelectHTMLAttributes } from "react";

interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export default function Select({
  label,
  error,
  id,
  className = "",
  children,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <div>
      {label && (
        <label
          htmlFor={selectId}
          className="
            mb-2
            block
            text-xs
            font-semibold
            uppercase
            tracking-wide
            text-(--color-text-muted)
          "
        >
          {label}

          {props.required && (
            <span
              className="ml-1 text-(--color-error)"
              aria-hidden="true"
            >
              *
            </span>
          )}
        </label>
      )}

      <select
        {...props}
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error
            ? `${selectId}-error`
            : undefined
        }
        className={`
          min-h-11
          w-full
          rounded-(--radius-md)
          border
          border-(--color-border)
          bg-(--color-surface)
          px-3.5
          py-2.5
          text-sm
          text-(--color-text)
          outline-none
          transition-colors
          duration-200
          focus:border-(--color-text)
          focus:ring-2
          focus:ring-(--color-accent)
          focus:ring-offset-1
          focus:ring-offset-(--color-background)
          disabled:cursor-not-allowed
          disabled:opacity-60
          ${
            error
              ? "border-(--color-error) focus:border-(--color-error) focus:ring-(--color-error)"
              : ""
          }
          ${className}
        `}
      >
        {children}
      </select>

      {error && (
        <p
          id={`${selectId}-error`}
          role="alert"
          className="mt-2 text-xs text-(--color-error)"
        >
          {error}
        </p>
      )}
    </div>
  );
}