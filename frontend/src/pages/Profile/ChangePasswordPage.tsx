import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

import { authService } from "../../services/authService";
import Button from "../../components/common/Button";

interface FormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

type PasswordFieldProps = {
  label: string;
  name: keyof FormData;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  show: boolean;
  onToggle: () => void;
};

export default function ChangePasswordPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function togglePassword(field: "current" | "new" | "confirm") {
    setShowPasswords((current) => ({
      ...current,
      [field]: !current[field],
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (formData.new_password.length < 6) {
      setError("Your new password must be at least 6 characters long.");
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError("New passwords do not match.");
      return;
    }

    if (formData.current_password === formData.new_password) {
      setError(
        "Your new password must be different from your current password."
      );
      return;
    }

    setSaving(true);

    try {
      await authService.changePassword(formData);

      navigate("/profile", {
        replace: true,
        state: {
          passwordChanged: true,
        },
      });
    } catch (error: unknown) {
      console.error("Failed to change password:", error);

      const responseData = (
        error as { response?: { data?: unknown } }
      ).response?.data;

      if (responseData && typeof responseData === "object") {
        const messages = Object.values(responseData)
          .flat()
          .filter(
            (value): value is string =>
              typeof value === "string"
          );

        setError(
          messages.length > 0
            ? messages.join(" ")
            : "Unable to change your password."
        );
      } else {
        setError("Unable to change your password.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Back */}
      <Button
            to="/profile"
            variant="secondary"
            rounded="full"
            className="mb-6 inline-flex items-center gap-2"
          >
            <ArrowLeft
              size={16}
              strokeWidth={1.8}
              aria-hidden="true"
            />
            Back to Profile
          </Button>

      {/* Header */}
      <div className="mt-7 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-(--color-text)">
          Change Password
        </h1>

        <p className="mt-1 text-sm text-(--color-text-muted)">
          Update your password to keep your account secure.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-8">
        <div
          className="
            rounded-3xl
            border
            border-(--color-border)
            bg-(--color-surface)
            p-5
            sm:p-6
          "
        >
          <div className="space-y-5">
            <PasswordField
              label="Current Password"
              name="current_password"
              value={formData.current_password}
              onChange={handleChange}
              show={showPasswords.current}
              onToggle={() => togglePassword("current")}
            />

            <PasswordField
              label="New Password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              show={showPasswords.new}
              onToggle={() => togglePassword("new")}
            />

            <PasswordField
              label="Confirm New Password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              show={showPasswords.confirm}
              onToggle={() => togglePassword("confirm")}
            />

            <div className="flex items-start gap-2 pt-1">
              <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-text-muted)" />

              <p className="text-xs leading-5 text-(--color-text-muted)">
                Your password must be at least 6 characters long.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="
                  rounded-xl
                  border
                  border-red-500/20
                  bg-red-500/5
                  px-4
                  py-3
                  text-sm
                  text-red-500
                "
              >
                {error}
              </div>
            )}
          </div>

          {/* Actions */}
          <div
            className="
              mt-8
              flex
              flex-col-reverse
              gap-3
              sm:flex-row
              sm:justify-center
            "
          >
            <Link
              to="/profile"
              className="
                inline-flex
                min-h-11
                items-center
                justify-center
                rounded-xl
                border
                border-(--color-border)
                px-5
                text-sm
                font-medium
                text-(--color-text)
                transition
                hover:bg-(--color-background)
              "
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="
                inline-flex
                min-h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-(--color-text)
                px-5
                text-sm
                font-semibold
                text-(--color-background)
                transition
                hover:opacity-85
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving ? (
                "Updating..."
              ) : (
                <>
                  Update Password
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  show,
  onToggle,
}: PasswordFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
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
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          required
          autoComplete={
            name === "current_password"
              ? "current-password"
              : "new-password"
          }
          className="
            w-full
            rounded-xl
            border
            border-(--color-border)
            bg-(--color-background)
            px-3.5
            py-3
            pr-12
            text-sm
            text-(--color-text)
            outline-none
            transition
            focus:border-(--color-text-muted)
          "
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? `Hide ${label}` : `Show ${label}`}
          className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            rounded-lg
            p-1
            text-(--color-text-muted)
            transition
            hover:bg-(--color-surface)
            hover:text-(--color-text)
          "
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}