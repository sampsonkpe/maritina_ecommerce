import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

import { authService } from "../../services/authService";

interface FormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

type PasswordFieldProps = {
  label: string;
  name: keyof FormData;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
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

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(null);

    if (formData.new_password !== formData.confirm_password) {
      setError("New passwords do not match.");
      return;
    }

    if (formData.current_password === formData.new_password) {
      setError("Your new password must be different from your current password.");
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

        if (messages.length > 0) {
          setError(messages.join(" "));
        } else {
          setError("Unable to change your password.");
        }
      } else {
        setError("Unable to change your password.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        to="/profile"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={17} />
        Back to Profile
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Change Password
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Update your password to keep your account secure.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
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

            <p className="text-xs text-gray-500">
              Your password must be at least 6 characters long.
            </p>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                {error}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/profile"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Updating..." : "Update Password"}
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
}: PasswordFieldProps & {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-gray-700"
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
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-11 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? `Hide ${label}` : `Show ${label}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}