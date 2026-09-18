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
      } else if (
        currentScrollY < lastScrollY.current
      ) {
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

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div
            className="
              border-t
              border-(--color-border)
              bg-(--color-background)/45
              backdrop-blur
              py-4
              md:hidden
            "
          >
            <div className="flex flex-col">
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
        )}
      </div>
    </nav>
  );
}