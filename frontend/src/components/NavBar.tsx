import { Link } from "react-router-dom";

import LogoutButton from "./auth/LogoutButton";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function NavBar() {
  const {
    authenticated,
    user,
  } = useAuth();

  const {
    itemCount,
    loading,
  } = useCart();

  return (
    <nav className="border-b border-[var(--color-border)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 p-4">
        <Link
          to="/"
          className="shrink-0 text-xl font-bold"
        >
          KAHWƐ by Maritina Foods
        </Link>

        <div className="flex shrink-0 items-center gap-4 sm:gap-6">
          <Link to="/" className="whitespace-nowrap">
            Home
          </Link>

          <Link to="/products" className="whitespace-nowrap">
            Products
          </Link>

          {!authenticated ? (
            <>
              <Link to="/cart" className="whitespace-nowrap">
                Cart {loading ? "" : `[${itemCount}]`}
              </Link>

              <Link to="/login" className="whitespace-nowrap">
                Login
              </Link>

              <Link to="/register" className="whitespace-nowrap">
                Register
              </Link>
            </>
          ) : user?.is_staff ? (
            <>
              <Link to="/admin/orders" className="whitespace-nowrap">
                All Orders
              </Link>

              <LogoutButton />
            </>
          ) : (
            <>
              <Link to="/cart" className="whitespace-nowrap">
                Cart [{itemCount}]
              </Link>

              <Link to="/orders" className="whitespace-nowrap">
                Orders
              </Link>

              <LogoutButton />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}