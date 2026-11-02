
import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home04Icon,
  ShoppingBag03Icon,
  ShoppingCart02Icon,
  PackageIcon,
  UserIcon,
  LogInIcon,
  UserAdd01Icon,
  MenuTwoLineIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

import LogoutButton from "./auth/LogoutButton";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function NavBar() {
  const { authenticated, user } = useAuth();
  const { itemCount, loading } = useCart();

  const location = useLocation();

  const [mobileMenuPath, setMobileMenuPath] =
    useState<string | null>(null);

  const mobileMenuOpen =
    mobileMenuPath === location.pathname;

  // Determine pages where the header must always remain visible.
  const alwaysVisible =
    location.pathname === "/" ||
    location.pathname.startsWith("/checkout") ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register") ||
    location.pathname.startsWith("/admin");

  const [hiddenHeaderPath, setHiddenHeaderPath] =
    useState<string | null>(null);

  const headerVisible =
    alwaysVisible ||
    mobileMenuOpen ||
    hiddenHeaderPath !== location.pathname;

  const lastScrollY = useRef(0);

  const closeMobileMenu = () => {
    setMobileMenuPath(null);
    setHiddenHeaderPath(null);
  };

  // Header scroll behaviour.
  useEffect(() => {
    lastScrollY.current = window.scrollY;

    // Keep the header visible on selected pages.
    if (alwaysVisible || mobileMenuOpen) {
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 0) {
        setHiddenHeaderPath(null);
        lastScrollY.current = currentScrollY;
        return;
      }

      const scrollDifference =
        currentScrollY - lastScrollY.current;

      // Ignore small movements to prevent flickering.
      if (Math.abs(scrollDifference) < 5) {
        return;
      }

      if (scrollDifference > 0) {
        setHiddenHeaderPath(location.pathname);
      } else {
        setHiddenHeaderPath(null);
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
  }, [
    location.pathname,
    alwaysVisible,
    mobileMenuOpen,
  ]);

  // Close the mobile menu using Escape.
  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [mobileMenuOpen]);

  const navLinkClasses = ({
    isActive,
  }: {
    isActive: boolean;
  }) => `
    flex
    items-center
    gap-2
    whitespace-nowrap
    rounded-(--radius-sm)
    px-2
    py-1.5
    text-sm
    text-(--color-text)
    transition-opacity
    duration-200
    hover:opacity-60
    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-(--color-accent)
    focus-visible:ring-offset-2
    focus-visible:ring-offset-(--color-background)
    ${isActive ? "font-semibold" : ""}
  `;

  const mobileLinkClasses = ({
    isActive,
  }: {
    isActive: boolean;
  }) => `
    flex
    items-center
    gap-2
    border-b
    border-(--color-border)
    py-3
    text-sm
    text-(--color-text)
    transition-opacity
    duration-200
    hover:opacity-60
    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-(--color-accent)
    focus-visible:ring-offset-1
    focus-visible:ring-offset-(--color-background)
    ${isActive ? "font-semibold" : ""}
  `;

  const cartCount = !loading && (
    <span
      className="
        inline-flex
        min-w-5
        h-5
        items-center
        justify-center
        rounded-(--radius-full)
        border-[1.8px]
        border-(--color-text)
        px-1
        text-[0.6875rem]
        font-medium
        leading-none
        text-(--color-text)
      "
    >
      {itemCount}
    </span>
  );

  return (
    <>
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMobileMenu}
          className="
            fixed
            inset-x-0
            top-[4.5rem]
            bottom-0
            z-40
            bg-(--color-overlay)/15
            md:hidden
          "
        />
      )}

      {/* Main Navigation */}
      <nav
        className={`
          sticky
          top-0
          z-50
          border-b
          border-(--color-border)
          bg-(--color-background)/45
          backdrop-blur
          transition-transform
          duration-300
          ease-out
          ${
            !alwaysVisible &&
            !mobileMenuOpen &&
            !headerVisible
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
              gap-4
            "
          >
            {/* Brand */}
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="
                shrink-0
                rounded-(--radius-sm)
                text-base
                font-semibold
                tracking-tight
                text-(--color-text)
                transition-opacity
                duration-200
                hover:opacity-70
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-(--color-accent)
                focus-visible:ring-offset-2
                focus-visible:ring-offset-(--color-background)
                sm:text-lg
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
                gap-5
                md:flex
              "
            >
              <NavLink
                to="/"
                end
                className={navLinkClasses}
              >
                <HugeiconsIcon
                  icon={Home04Icon}
                  size={20}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span>Home</span>
              </NavLink>

              <NavLink
                to="/products"
                className={navLinkClasses}
              >
                <HugeiconsIcon
                  icon={ShoppingBag03Icon}
                  size={20}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span>Products</span>
              </NavLink>

              {!authenticated ? (
                <>
                  <NavLink
                    to="/cart"
                    className={navLinkClasses}
                  >
                    <HugeiconsIcon
                      icon={ShoppingCart02Icon}
                      size={20}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    <span>Cart</span>
                    {cartCount}
                  </NavLink>

                  <NavLink
                    to="/login"
                    className={navLinkClasses}
                  >
                    <HugeiconsIcon
                      icon={LogInIcon}
                      size={20}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    <span>Login</span>
                  </NavLink>

                  <NavLink
                    to="/register"
                    className={navLinkClasses}
                  >
                    <HugeiconsIcon
                      icon={UserAdd01Icon}
                      size={20}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    <span>Register</span>
                  </NavLink>
                </>
              ) : user?.is_staff ? (
                <NavLink
                  to="/admin/orders"
                  className={navLinkClasses}
                >
                  <HugeiconsIcon
                    icon={PackageIcon}
                    size={20}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  <span>All Orders</span>
                </NavLink>
              ) : (
                <>
                  <NavLink
                    to="/cart"
                    className={navLinkClasses}
                  >
                    <HugeiconsIcon
                      icon={ShoppingCart02Icon}
                      size={20}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    <span>Cart</span>
                    {cartCount}
                  </NavLink>

                  <NavLink
                    to="/orders"
                    className={navLinkClasses}
                  >
                    <HugeiconsIcon
                      icon={PackageIcon}
                      size={20}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    <span>Orders</span>
                  </NavLink>

                  <NavLink
                    to="/profile"
                    className={navLinkClasses}
                  >
                    <HugeiconsIcon
                      icon={UserIcon}
                      size={20}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    <span>Profile</span>
                  </NavLink>
                </>
              )}

              {authenticated && <LogoutButton />}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() =>
                setMobileMenuPath(
                  mobileMenuOpen
                    ? null
                    : location.pathname
                )
              }
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              className="
                rounded-(--radius-sm)
                p-2
                text-(--color-text)
                transition-opacity
                duration-200
                hover:opacity-60
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-(--color-accent)
                focus-visible:ring-offset-2
                focus-visible:ring-offset-(--color-background)
                md:hidden
              "
            >
              {mobileMenuOpen ? (
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={24}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              ) : (
                <HugeiconsIcon
                  icon={MenuTwoLineIcon}
                  size={24}
                  strokeWidth={1.8}
                  className="-scale-x-100"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Panel */}
      <div
        id="mobile-navigation"
        aria-hidden={!mobileMenuOpen}
        inert={!mobileMenuOpen}
        className={`
          fixed
          inset-x-0
          top-[4.5rem]
          z-[60]
          max-h-[calc(100dvh-4.5rem)]
          overflow-y-auto

          border-t
          border-(--color-border)

          bg-(--color-background)/45
          backdrop-blur

          px-4
          py-4

          transition-[opacity,transform,visibility]
          duration-200
          ease-out

          md:hidden

          ${
            mobileMenuOpen
              ? "visible translate-y-0 opacity-100 pointer-events-auto"
              : "invisible -translate-y-2 opacity-0 pointer-events-none"
          }
        `}
      >
        <div className="mx-auto flex max-w-7xl flex-col">
          <NavLink
            to="/"
            end
            onClick={closeMobileMenu}
            className={mobileLinkClasses}
          >
            <HugeiconsIcon
              icon={Home04Icon}
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/products"
            onClick={closeMobileMenu}
            className={mobileLinkClasses}
          >
            <HugeiconsIcon
              icon={ShoppingBag03Icon}
              size={18}
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <span>Products</span>
          </NavLink>

          {!authenticated ? (
            <>
              <NavLink
                to="/cart"
                onClick={closeMobileMenu}
                className={mobileLinkClasses}
              >
                <HugeiconsIcon
                  icon={ShoppingCart02Icon}
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span>Cart</span>
                {cartCount}
              </NavLink>

              <NavLink
                to="/login"
                onClick={closeMobileMenu}
                className={mobileLinkClasses}
              >
                <HugeiconsIcon
                  icon={LogInIcon}
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span>Login</span>
              </NavLink>

              <NavLink
                to="/register"
                onClick={closeMobileMenu}
                className={mobileLinkClasses}
              >
                <HugeiconsIcon
                  icon={UserAdd01Icon}
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span>Register</span>
              </NavLink>
            </>
          ) : user?.is_staff ? (
            <>
              <NavLink
                to="/admin/orders"
                onClick={closeMobileMenu}
                className={mobileLinkClasses}
              >
                <HugeiconsIcon
                  icon={PackageIcon}
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span>All Orders</span>
              </NavLink>

              <div className="pt-3">
                <LogoutButton />
              </div>
            </>
          ) : (
            <>
              <NavLink
                to="/cart"
                onClick={closeMobileMenu}
                className={mobileLinkClasses}
              >
                <HugeiconsIcon
                  icon={ShoppingCart02Icon}
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span>Cart</span>
                {cartCount}
              </NavLink>

              <NavLink
                to="/orders"
                onClick={closeMobileMenu}
                className={mobileLinkClasses}
              >
                <HugeiconsIcon
                  icon={PackageIcon}
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span>Orders</span>
              </NavLink>

              <NavLink
                to="/profile"
                onClick={closeMobileMenu}
                className={mobileLinkClasses}
              >
                <HugeiconsIcon
                  icon={UserIcon}
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span>Profile</span>
              </NavLink>

              <div className="pt-3">
                <LogoutButton />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}