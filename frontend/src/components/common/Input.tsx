import type {
  InputHTMLAttributes,
} from "react";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div>
      <label
        htmlFor={inputId}
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

      <input
        {...props}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${inputId}-error` : undefined
        }
        className={`
          min-h-11
          w-full
          rounded-(--radius-md)
          border
          border-(--color-border)
          bg-(--color-background)
          px-3.5
          py-2.5
          text-sm
          text-(--color-text)
          outline-none
          transition-colors
          duration-200
          placeholder:text-(--color-text-subtle)
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
      />

      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="mt-2 text-xs text-(--color-error)"
        >
          {error}
        </p>
      )}
    </div>
  );
}