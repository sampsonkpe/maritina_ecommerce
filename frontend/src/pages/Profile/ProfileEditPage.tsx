import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { authService } from "../../services/authService";
import type { Profile } from "../../services/authService";
import Button from "../../components/common/Button";

interface FormData {
  full_name: string;
  username: string;
  phone: string;
}

export default function ProfileEditPage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    username: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await authService.getProfile();

        setProfile(data);
        setFormData({
          full_name: data.full_name,
          username: data.username ?? "",
          phone: data.phone ?? "",
        });
      } catch (error) {
        console.error("Failed to load profile:", error);
        setError("Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (!formData.full_name.trim()) {
      setError("Full name is required.");
      return;
    }

    setSaving(true);

    try {
      await authService.updateProfile({
        full_name: formData.full_name.trim(),
        username: formData.username.trim() || undefined,
        phone: formData.phone.trim() || null,
      });

      navigate("/profile", {
        replace: true,
        state: {
          profileUpdated: true,
        },
      });
    } catch (error: unknown) {
      console.error("Failed to update profile:", error);

      const responseData =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response
          ? error.response.data
          : undefined;

      if (responseData && typeof responseData === "object") {
        const messages = Object.values(responseData)
          .flat()
          .filter((value): value is string => typeof value === "string");

        setError(
          messages.length > 0
            ? messages.join(" ")
            : "Unable to update your profile."
        );
      } else {
        setError("Unable to update your profile.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm text-(--color-text-muted)">
          Loading profile...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6">
          <p className="text-sm text-red-500">
            {error ?? "Unable to load your profile."}
          </p>

          <Link
            to="/profile"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-(--color-text) transition-opacity hover:opacity-70"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>
        </div>
      </div>
    );
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
          Edit Profile
        </h1>

        <p className="mt-1 text-sm text-(--color-text-muted)">
          Update your personal information.
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
            <FormField
              label="Full Name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />

            <FormField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />

            <FormField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              type="tel"
            />

            {/* Email */}
            <div>
              <label
                htmlFor="email"
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
                Email
              </label>

              <input
                id="email"
                type="email"
                value={profile.email ?? ""}
                disabled
                className="
                  w-full
                  rounded-xl
                  border
                  border-(--color-border)
                  bg-(--color-background)
                  px-3.5
                  py-3
                  text-sm
                  text-(--color-text-muted)
                  outline-none
                "
              />

              <p className="mt-2 text-xs text-(--color-text-muted)">
                Email changes require a separate verification process.
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
                "Saving..."
              ) : (
                <>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
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

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="
          w-full
          rounded-xl
          border
          border-(--color-border)
          bg-(--color-background)
          px-3.5
          py-3
          text-sm
          text-(--color-text)
          outline-none
          transition
          placeholder:text-(--color-text-muted)
          focus:border-(--color-text-muted)
        "
      />
    </div>
  );
}