import type { TextareaHTMLAttributes } from "react";

interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export default function Textarea({
  label,
  error,
  id,
  className = "",
  ...props
}: TextareaProps) {
  const textareaId = id ?? props.name;

  return (
    <div>
      <label
        htmlFor={textareaId}
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

      <textarea
        {...props}
        id={textareaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error
            ? `${textareaId}-error`
            : undefined
        }
        className={`
          min-h-28
          w-full
          resize-y
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
          id={`${textareaId}-error`}
          role="alert"
          className="mt-2 text-xs text-(--color-error)"
        >
          {error}
        </p>
      )}
    </div>
  );
}