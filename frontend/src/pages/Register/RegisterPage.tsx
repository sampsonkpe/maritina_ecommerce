import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { authService } from "../../services/authService";
import Alert from "../../components/common/Alert";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim() && !phone.trim()) {
      setError(
        "Please provide either an email address or phone number."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      await authService.register({
        username: username.trim(),
        full_name: fullName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        password,
      });

      setSuccess(
        email.trim()
          ? "Account created successfully. Please check your email to verify your account."
          : "Account created successfully."
      );

      setTimeout(() => {
        navigate("/login");
      }, 2500);

    } catch (error: unknown) {
      console.error(error);

      const responseData =
        typeof error === "object" &&
        error !== null &&
        "response" in error
          ? (error as {
              response?: {
                data?: {
                  error?: string;
                  detail?: string;
                };
              };
            }).response?.data
          : undefined;

      const message =
        responseData?.error ||
        responseData?.detail ||
        "Failed to create account.";

      setError(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-8">

      <h1 className="mb-2 text-3xl font-bold">
        Create an account
      </h1>

      <p className="mb-6 text-gray-600">
        Create your KAHWƐ account to manage your
        orders and checkout faster.
      </p>

      {error && (
        <div className="mb-4">
          <Alert
            message={error}
            variant="error"
          />
        </div>
      )}

      {success && (
        <div className="mb-4">
          <Alert
            message={success}
            variant="success"
          />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        <div>
          <label className="mb-1 block font-medium">
            Full Name
          </label>

          <input
            type="text"
            value={fullName}
            onChange={(e) =>
              setFullName(e.target.value)
            }
            placeholder="Enter your full name"
            className="w-full rounded-md border p-3"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Username
          </label>

          <input
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            placeholder="Choose a username"
            className="w-full rounded-md border p-3"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Email Address
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Enter your email address"
            className="w-full rounded-md border p-3"
          />

          <p className="mt-1 text-sm text-gray-500">
            Used for order updates and email verification.
          </p>
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Phone Number
          </label>

          <input
            type="tel"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            placeholder="Enter your phone number"
            className="w-full rounded-md border p-3"
          />

          <p className="mt-1 text-sm text-gray-500">
            Provide an email or phone number.
          </p>
        </div>

        <div>
          <label className="mb-1 block font-medium">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Create a password"
            className="w-full rounded-md border p-3"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black px-4 py-3 text-white disabled:opacity-50"
        >
          {loading
            ? "Creating account..."
            : "Create Account"}
        </button>

      </form>

      <p className="mt-6 text-center text-gray-600">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="font-medium text-black underline"
        >
          Login
        </button>
      </p>

    </div>
  );
}