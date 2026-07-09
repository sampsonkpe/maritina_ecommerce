import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { authService } from "../../services/authService";

import {
  saveTokens,
} from "../../utils/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      const data =
        await authService.login(
          identifier,
          password
        );

      saveTokens(
        data.tokens.access,
        data.tokens.refresh
      );

      navigate("/products");
    } catch {
      setError(
        "Invalid credentials"
      );
    }
  };

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="mb-6 text-3xl font-bold">
        Login
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          type="text"
          placeholder="Username, Email or Phone"
          value={identifier}
          onChange={(e) =>
            setIdentifier(
              e.target.value
            )
          }
          className="w-full rounded-lg border p-3"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          className="w-full rounded-lg border p-3"
        />

        {error && (
          <p className="text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-lg bg-black px-4 py-3 text-white"
        >
          Login
        </button>
      </form>
    </div>
  );
}