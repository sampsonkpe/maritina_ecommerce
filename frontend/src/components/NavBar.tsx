import { Link } from "react-router-dom";
import LogoutButton from "./auth/LogoutButton";

import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const {
    authenticated,
    user,
  } = useAuth();
  
  return (
    <nav className="border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
        <Link
          to="/"
          className="text-xl font-bold"
        >
          KAHWƐ by Maritina Foods
        </Link>

        <div className="flex gap-6">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>

          {!authenticated ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : user?.is_staff ? (
            <>
              <Link to="/admin/orders">
                Admin Orders
              </Link>

              <LogoutButton />
            </>
          ) : (
            <>
              <Link to="/cart">Cart</Link>
              <Link to="/orders">Orders</Link>

              <LogoutButton />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}