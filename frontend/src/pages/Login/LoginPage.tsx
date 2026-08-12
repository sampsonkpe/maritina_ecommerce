import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { orderService } from "../../services/orderService";
import { cartService } from "../../services/cartService";

import Alert from "../../components/common/Alert";

import {
  saveTokens,
  saveUser,
} from "../../utils/auth";

export default function LoginPage() {
  const navigate = useNavigate();

const {
  setUser,
  setAuthenticated,
} = useAuth();

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

    saveUser(data.user);

    try {
      await cartService.mergeGuestCart();
    } catch {
      // Continue login even if there is no guest cart to merge.
    }

    setUser(data.user);
    setAuthenticated(true);

    try {
      await orderService.claimGuestOrders();
    } catch {
      // Continue login even if there are no claimable orders.
    }

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
          aria-label="Username, Email or Phone"
          type="text"
          placeholder="Username, Email or Phone"
          value={identifier}
          onChange={(e) =>
            setIdentifier(
              e.target.value
            )
          }
          className="w-full rounded-md border p-3"
        />

        <input
          aria-label="Password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          className="w-full rounded-md border p-3"
        />

        {error && <Alert message={error} />}

        <button
          type="submit"
          className="w-full rounded-md bg-black px-4 py-3 text-white"
        >
          Login
        </button>
      </form>
    </div>
  );
}