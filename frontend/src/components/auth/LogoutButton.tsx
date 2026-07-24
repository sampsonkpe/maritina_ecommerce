import { useNavigate } from "react-router-dom";

import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

import {
  getRefreshToken,
  logout,
} from "../../utils/auth";

export default function LogoutButton() {
  const navigate = useNavigate();

  const {
    setUser,
    setAuthenticated,
  } = useAuth();

  async function handleLogout() {
    const refresh = getRefreshToken();

    try {
      if (refresh) {
        await authService.logout(refresh);
      }
    } catch (error) {
      console.error(error);
    } finally {
      logout();

      setUser(null);
      setAuthenticated(false);

      navigate("/login", {
        replace: true,
      });
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-md border px-4 py-2 transition hover:bg-gray-100"
    >
      Logout
    </button>
  );
}