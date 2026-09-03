import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  Menu,
  X,
} from "lucide-react";

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

  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [headerVisible, setHeaderVisible] =
    useState(true);

  const lastScrollY = useRef(0);

  const isHomePage =
    location.pathname === "/";

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    if (isHomePage) {
      return;
    }

    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 0) {
        setHeaderVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY.current) {
        setHeaderVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setHeaderVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [isHomePage]);

  return (
    <nav
      className={`
        sticky
        top-0
        z-50
        border-b
        border-(--color-border)
        backdrop-blur
        transition-transform
        duration-300
        ease-out
        ${
          !isHomePage && !headerVisible
            ? "-translate-y-full"
            : "translate-y-0"
        }
      `}
    >
      <div
        className="
          mx-auto
          max-w-7xl
          px-4
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            flex
            min-h-18
            items-center
            justify-between
            gap-6
          "
        >
          {/* Brand */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="
              shrink-0
              text-lg
              font-bold
              tracking-tight
              text-(--color-text)
              sm:text-xl
            "
          >
            <span className="sm:hidden">
              KAHWƐ
            </span>

            <span className="hidden sm:inline">
              KAHWƐ by Maritina Foods
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div
            className="
              hidden
              items-center
              gap-6
              md:flex
            "
          >
            <Link
              to="/"
              className="
                whitespace-nowrap
                text-sm
                transition-opacity
                hover:opacity-60
              "
            >
              Home
            </Link>

            <Link
              to="/products"
              className="
                whitespace-nowrap
                text-sm
                transition-opacity
                hover:opacity-60
              "
            >
              Products
            </Link>

            {!authenticated ? (
              <>
                <Link
                  to="/cart"
                  className="
                    whitespace-nowrap
                    text-sm
                    transition-opacity
                    hover:opacity-60
                  "
                >
                  Cart
                  {!loading && ` [${itemCount}]`}
                </Link>

                <Link
                  to="/login"
                  className="
                    whitespace-nowrap
                    text-sm
                    transition-opacity
                    hover:opacity-60
                  "
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="
                    whitespace-nowrap
                    text-sm
                    transition-opacity
                    hover:opacity-60
                  "
                >
                  Register
                </Link>
              </>
            ) : user?.is_staff ? (
              <Link
                to="/admin/orders"
                className="
                  whitespace-nowrap
                  text-sm
                  transition-opacity
                  hover:opacity-60
                "
              >
                All Orders
              </Link>
            ) : (
              <>
                <Link
                  to="/cart"
                  className="
                    whitespace-nowrap
                    text-sm
                    transition-opacity
                    hover:opacity-60
                  "
                >
                  Cart
                  {!loading && ` [${itemCount}]`}
                </Link>

                <Link
                  to="/orders"
                  className="
                    whitespace-nowrap
                    text-sm
                    transition-opacity
                    hover:opacity-60
                  "
                >
                  Orders
                </Link>

                <Link
                  to="/profile"
                  className="
                    whitespace-nowrap
                    text-sm
                    transition-opacity
                    hover:opacity-60
                  "
                >
                  Profile
                </Link>
              </>
            )}

            {authenticated && <LogoutButton />}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                (open) => !open
              )
            }
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileMenuOpen}
            className="
              rounded-md
              p-2
              text-(--color-text)
              transition-opacity
              hover:opacity-60
              md:hidden
            "
          >
            {mobileMenuOpen ? (
              <X
                size={24}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            ) : (
              <Menu
                size={24}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div
            className="
              border-t
              border-(--color-border)
              py-4
              md:hidden
            "
          >
            <div className="flex flex-col">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="
                  border-b
                  border-(--color-border)
                  py-3
                  text-sm
                "
              >
                Home
              </Link>

              <Link
                to="/products"
                onClick={closeMobileMenu}
                className="
                  border-b
                  border-(--color-border)
                  py-3
                  text-sm
                "
              >
                Products
              </Link>

              {!authenticated ? (
                <>
                  <Link
                    to="/cart"
                    onClick={closeMobileMenu}
                    className="
                      border-b
                      border-(--color-border)
                      py-3
                      text-sm
                    "
                  >
                    Cart
                    {!loading &&
                      ` [${itemCount}]`}
                  </Link>

                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="
                      border-b
                      border-(--color-border)
                      py-3
                      text-sm
                    "
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="
                      py-3
                      text-sm
                    "
                  >
                    Register
                  </Link>
                </>
              ) : user?.is_staff ? (
                <>
                  <Link
                    to="/admin/orders"
                    onClick={closeMobileMenu}
                    className="
                      border-b
                      border-(--color-border)
                      py-3
                      text-sm
                    "
                  >
                    All Orders
                  </Link>

                  <div className="pt-3">
                    <LogoutButton />
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/cart"
                    onClick={closeMobileMenu}
                    className="
                      border-b
                      border-(--color-border)
                      py-3
                      text-sm
                    "
                  >
                    Cart
                    {!loading &&
                      ` [${itemCount}]`}
                  </Link>

                  <Link
                    to="/orders"
                    onClick={closeMobileMenu}
                    className="
                      border-b
                      border-(--color-border)
                      py-3
                      text-sm
                    "
                  >
                    Orders
                  </Link>

                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="
                      border-b
                      border-(--color-border)
                      py-3
                      text-sm
                    "
                  >
                    Profile
                  </Link>

                  <div className="pt-3">
                    <LogoutButton />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}