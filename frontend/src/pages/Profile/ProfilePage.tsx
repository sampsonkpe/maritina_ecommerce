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
      <div className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-sm text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <p className="text-sm text-red-600">
          Unable to load your profile.
        </p>
      </div>
    );
  }

  const firstName = profile.full_name.trim().split(/\s+/)[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Profile
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, <b>{firstName}</b>.
        </p>
      </div>

      {/* Personal Information */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Personal Information
          </h2>

          <Link
            to="/profile/edit"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:underline"
          >
            <Pencil size={15} />
            Edit
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="grid gap-5 sm:grid-cols-2">
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
                profile.email_verified ? "Verified" : "Not verified"
              }
            />
          </div>
        </div>
      </section>

      {/* Account */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Account
        </h2>

        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          <ProfileLink
            to="/orders"
            icon={<Package size={19} />}
            title="Orders"
            description="View and track your orders"
          />

          <ProfileLink
            to="/favourites"
            icon={<Heart size={19} />}
            title="Favourites"
            description="View your saved products"
          />

          <ProfileLink
            to="/addresses"
            icon={<MapPin size={19} />}
            title="Addresses"
            description="Manage your delivery addresses"
          />
        </div>
      </section>

      {/* Security */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Security
        </h2>

        <div className="rounded-xl border border-gray-200 bg-white">
          <ProfileLink
            to="/profile/change-password"
            icon={<KeyRound size={19} />}
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
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-sm text-gray-900">{value}</p>
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
      className="flex items-center gap-4 px-5 py-4 transition hover:bg-gray-50"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </div>

      <ChevronRight size={18} className="shrink-0 text-gray-400" />
    </Link>
  );
}