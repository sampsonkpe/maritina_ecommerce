import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Heart,
  KeyRound,
  MapPin,
  Package,
  Pencil,
} from "lucide-react";

import { authService } from "../../services/authService";
import type { Profile } from "../../services/authService";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await authService.getProfile();
        setProfile(data);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm text-(--color-text-muted)">
          Loading profile...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm text-red-600">
          Unable to load your profile.
        </p>
      </div>
    );
  }

  const firstName = profile.full_name.trim().split(/\s+/)[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-(--color-text)">
          Profile
        </h1>

        <p className="mt-1 text-sm text-(--color-text-muted)">
          Welcome back,{" "}
          <span className="font-medium text-(--color-text)">
            {firstName}
          </span>
          .
        </p>
      </header>

      {/* Personal Information */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-(--color-text-muted)">
            Personal Information
          </h2>

          <Link
            to="/profile/edit"
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-lg
              px-2
              py-1.5
              text-sm
              font-medium
              text-(--color-text)
              transition
              hover:bg-(--color-surface-muted)
            "
          >
            <Pencil size={15} strokeWidth={1.8} />
            Edit
          </Link>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-(--color-border)
            bg-(--color-surface)
            p-5
            sm:p-6
          "
        >
          <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
            <ProfileItem
              label="Full Name"
              value={profile.full_name}
            />

            <ProfileItem
              label="Username"
              value={profile.username || "Not set"}
            />

            <ProfileItem
              label="Email"
              value={profile.email || "Not set"}
            />

            <ProfileItem
              label="Phone"
              value={profile.phone || "Not set"}
            />

            <ProfileItem
              label="Email Status"
              value={
                profile.email_verified
                  ? "Verified"
                  : "Not verified"
              }
              status={profile.email_verified}
            />
          </div>
        </div>
      </section>

      {/* Account */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-(--color-text-muted)">
          Account
        </h2>

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-(--color-border)
            bg-(--color-surface)
          "
        >
          <ProfileLink
            to="/orders"
            icon={<Package size={19} strokeWidth={1.8} />}
            title="Orders"
            description="View and track your orders"
          />

          <ProfileLink
            to="/favourites"
            icon={<Heart size={19} strokeWidth={1.8} />}
            title="Favourites"
            description="View your saved products"
          />

          <ProfileLink
            to="/addresses"
            icon={<MapPin size={19} strokeWidth={1.8} />}
            title="Addresses"
            description="Manage your delivery addresses"
          />
        </div>
      </section>

      {/* Security */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-(--color-text-muted)">
          Security
        </h2>

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-(--color-border)
            bg-(--color-surface)
          "
        >
          <ProfileLink
            to="/profile/change-password"
            icon={<KeyRound size={19} strokeWidth={1.8} />}
            title="Change Password"
            description="Update your account password"
          />
        </div>
      </section>
    </div>
  );
}

function ProfileItem({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-(--color-text-muted)">
        {label}
      </p>

      {status !== undefined ? (
        <div className="mt-1.5 flex items-center gap-2">
          <span
            className={`
              h-1.5
              w-1.5
              rounded-full
              ${status ? "bg-green-500" : "bg-(--color-text-muted)"}
            `}
          />

          <p className="text-sm text-(--color-text)">
            {value}
          </p>
        </div>
      ) : (
        <p className="mt-1.5 text-sm text-(--color-text)">
          {value}
        </p>
      )}
    </div>
  );
}

function ProfileLink({
  to,
  icon,
  title,
  description,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="
        group
        flex
        items-center
        gap-4
        px-5
        py-4
        transition
        hover:bg-(--color-surface-muted)
        sm:px-6
      "
    >
      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          border
          border-(--color-border)
          bg-(--color-surface-muted)
          text-(--color-text-muted)
          transition
          group-hover:text-(--color-text)
        "
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-(--color-text)">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-(--color-text-muted)">
          {description}
        </p>
      </div>

      <ChevronRight
        size={18}
        strokeWidth={1.8}
        className="
          shrink-0
          text-(--color-text-muted)
          transition
          group-hover:translate-x-0.5
          group-hover:text-(--color-text)
        "
      />
    </Link>
  );
}