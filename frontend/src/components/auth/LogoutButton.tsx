import { useNavigate } from "react-router-dom";

import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

import { HugeiconsIcon } from "@hugeicons/react";
import { LogOutIcon } from "@hugeicons/core-free-icons";

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
      className="
        flex
        items-center
        gap-2
        rounded-(--radius-sm)
        px-0
        py-1.5
        text-sm
        text-(--color-error)
        transition-opacity
        duration-200
        hover:opacity-70
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-(--color-accent)
        focus-visible:ring-offset-2
        focus-visible:ring-offset-(--color-background)
      "
    >
      <HugeiconsIcon
        icon={LogOutIcon}
        size={20}
        strokeWidth={1.8}
        aria-hidden="true"
      />
      <span>Logout</span>
    </button>
  );
}