import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { addressService } from "../../services/addressService";
import { checkoutService } from "../../services/checkoutService";
import { paymentService } from "../../services/paymentService";
import { cartService } from "../../services/cartService";
import { useAuth } from "../../context/AuthContext";

import type { Address } from "../../types/address";
import type { Cart } from "../../types/cart";

import {
  DELIVERY_TYPE,
  type DeliveryType,
} from "../../constants/order";

import { useToast } from "../../context/useToast";

import LoadingState from "../../components/common/LoadingState";

import CheckoutSummary from "../../components/orders/CheckoutSummary";
import CheckoutAddressSelector from "../../components/orders/CheckoutAddressSelector";
import GuestContactForm from "../../components/orders/GuestContactForm";
import AddressForm from "../../components/orders/AddressForm";
import DeliveryMethodSelector from "../../components/orders/DeliveryMethodSelector";

import { useCheckoutSession } from "../../hooks/useCheckoutSession";

export default function CheckoutPage() {
  const { authenticated } = useAuth();

  const [guestStarted, setGuestStarted] =
    useState(false);

  const [guestFullName, setGuestFullName] =
    useState("");

  const [guestPhone, setGuestPhone] =
    useState("");

  const [guestEmail, setGuestEmail] =
    useState("");

  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [deliveryType, setDeliveryType] =
    useState<DeliveryType>(
      DELIVERY_TYPE.DELIVERY
    );

  const [selectedAddress, setSelectedAddress] =
    useState<number | null>(null);

  const [showAddresses, setShowAddresses] =
    useState(false);

  const [streetAddress, setStreetAddress] =
    useState("");

  const [area, setArea] =
    useState("");

  const [landmark, setLandmark] =
    useState("");

  const [city, setCity] =
    useState("");

  const [region, setRegion] =
    useState("");

  const [cart, setCart] =
    useState<Cart | null>(null);

  const [pageLoading, setPageLoading] =
    useState(true);

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const { showToast } = useToast();

  const navigate = useNavigate();

  const checkoutSessionEnabled =
    authenticated || guestStarted;

  const {
    expired: checkoutExpired,
    warning: checkoutWarning,
    remainingSeconds,
  } = useCheckoutSession(
    checkoutSessionEnabled
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const cartData =
          await cartService.getCart();

        setCart(cartData);

        if (authenticated) {
          const addressesData =
            await addressService.getAddresses();

          setAddresses(addressesData);

          const defaultAddress =
            addressesData.find(
              (address: Address) =>
                address.is_default
            );

          if (defaultAddress) {
            setSelectedAddress(
              defaultAddress.id
            );
          } else if (
            addressesData.length > 0
          ) {
            setSelectedAddress(
              addressesData[0].id
            );
          }
        }
      } catch (error) {
        console.error(error);

        showToast(
          "Failed to load checkout.",
          "error"
        );
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, [authenticated, showToast]);

  const handleCheckout = async () => {
    if (
      authenticated &&
      deliveryType === DELIVERY_TYPE.DELIVERY &&
      !selectedAddress
    ) {
      showToast(
        "Please select a delivery address.",
        "error"
      );

      return;
    }

    const guestAddress =
      [
        streetAddress,
        area,
        city,
        region,
      ]
        .filter(Boolean)
        .join(", ") +
      (landmark
        ? ` (Landmark: ${landmark})`
        : "");

    try {
      setPlacingOrder(true);

      const checkout =
        await checkoutService.createCheckout(
          deliveryType,
          authenticated &&
            deliveryType ===
              DELIVERY_TYPE.DELIVERY
            ? selectedAddress!
            : undefined,
          authenticated
            ? undefined
            : {
                full_name: guestFullName,
                email: guestEmail,
                phone: guestPhone,
                address:
                  deliveryType ===
                  DELIVERY_TYPE.DELIVERY
                    ? guestAddress
                    : undefined,
              }
        );

      const paymentResponse =
        await paymentService.initializePayment(
          checkout.id
        );

      if (
        !paymentResponse.status ||
        !paymentResponse.data?.authorization_url
      ) {
        throw new Error(
          paymentResponse.message ||
            "Unable to initialise payment."
        );
      }

      window.location.href =
        paymentResponse.data.authorization_url;
    } catch (error: unknown) {
      console.error(
        "Checkout/payment error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to continue to payment.";

      showToast(message, "error");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (pageLoading) {
    return (
      <LoadingState
        message="Loading checkout..."
      />
    );
  }

  /*
   * Guest entry state
   */
  if (!authenticated && !guestStarted) {
    return (
      <>
        {/* Page intro */}
        <section className="border-b border-(--color-border)">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-(--color-text-muted)">
                Your KAHWƐ Checkout
              </p>

              <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
                Time to checkout your order.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-(--color-text-muted) sm:text-lg">
                Complete your order and get your favourites on their way.
              </p>
            </div>
          </div>
        </section>

        {/* Guest choice */}
        <section>
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-xl rounded-2xl border border-(--color-border) p-6 sm:p-8">
              <div className="text-center">
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Continue as Guest
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-(--color-text-muted) sm:text-base">
                  Complete your purchase without
                  creating an account.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setGuestStarted(true)
                }
                className="mt-8 flex w-full items-center justify-center rounded-full border border-(--color-border) px-6 py-3 text-sm font-medium transition-colors hover:bg-(--color-surface-muted)"
              >
                Continue as Guest
              </button>

              <div className="my-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-(--color-border)" />

                <span className="text-xs font-medium uppercase tracking-[0.2em] text-(--color-text-muted)">
                  Or
                </span>

                <div className="h-px flex-1 bg-(--color-border)" />
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/login")
                }
                className="flex w-full items-center justify-center rounded-full border border-(--color-border) px-6 py-3 text-sm font-medium transition-colors hover:bg-(--color-surface-muted)"
              >
                Log In
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  /*
   * Expired checkout state
   */
  if (checkoutExpired) {
    return (
      <>
        {/* Page intro */}
        <section className="border-b border-(--color-border)">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-(--color-text-muted)">
                Your KAHWƐ Checkout
              </p>

              <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
                Time to checkout your order.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-(--color-text-muted) sm:text-lg">
                Your checkout session has expired.
              </p>
            </div>
          </div>
        </section>

        {/* Expired state */}
        <section>
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-xl rounded-2xl border border-(--color-border) p-6 text-center sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Checkout session expired
              </h2>

              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-(--color-text-muted) sm:text-base">
                Your checkout session expired because there was no activity for 30 minutes.
                Please review your cart and continue to checkout again.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/cart")
                }
                className="mt-8 inline-flex items-center justify-center rounded-full border border-(--color-border) px-6 py-3 text-sm font-medium transition-colors hover:bg-(--color-surface-muted)"
              >
                Return to Cart
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  const remainingMinutes =
    Math.ceil(remainingSeconds / 60);

  const deliveryFee =
    deliveryType === DELIVERY_TYPE.DELIVERY
      ? Number(cart?.delivery_fee ?? 0)
      : 0;

  const total =
    Number(cart?.subtotal ?? 0) +
    deliveryFee;

  return (
    <>
      {/* Page intro */}
      <section className="border-b border-(--color-border)">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-(--color-text-muted)">
              Your KAHWƐ Checkout
            </p>

            <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
              Time to checkout your order.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-(--color-text-muted) sm:text-lg">
              Complete your order and get your favourites on their way.
            </p>
          </div>
        </div>
      </section>

      {/* Checkout */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-8 lg:py-20">

          {checkoutWarning && (
            <div className="mb-8 rounded-2xl border border-(--color-border) px-5 py-4 text-sm text-(--color-text-muted)">
              Checkout will expire in{" "}
              <span className="font-medium text-(--color-text)">
                {remainingMinutes}{" "}
                {remainingMinutes === 1
                  ? "minute"
                  : "minutes"}
              </span>{" "}
              due to inactivity.
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">

            {/* Checkout details */}
            <div className="space-y-6">

              {authenticated ? (
                <>
                  <DeliveryMethodSelector
                    deliveryType={deliveryType}
                    onDeliveryTypeChange={
                      setDeliveryType
                    }
                  />

                  {deliveryType ===
                    DELIVERY_TYPE.DELIVERY && (
                    <CheckoutAddressSelector
                      addresses={addresses}
                      selectedAddress={
                        selectedAddress
                      }
                      showAddresses={
                        showAddresses
                      }
                      onSelectAddress={(id) => {
                        setSelectedAddress(id);
                        setShowAddresses(false);
                      }}
                      onToggleAddresses={() =>
                        setShowAddresses(
                          (prev) => !prev
                        )
                      }
                    />
                  )}
                </>
              ) : (
                <>
                  <GuestContactForm
                    fullName={guestFullName}
                    phone={guestPhone}
                    email={guestEmail}
                    onFullNameChange={
                      setGuestFullName
                    }
                    onPhoneChange={
                      setGuestPhone
                    }
                    onEmailChange={
                      setGuestEmail
                    }
                  />

                  <DeliveryMethodSelector
                    deliveryType={deliveryType}
                    onDeliveryTypeChange={
                      setDeliveryType
                    }
                  />

                  {deliveryType ===
                    DELIVERY_TYPE.DELIVERY && (
                    <AddressForm
                      streetAddress={
                        streetAddress
                      }
                      area={area}
                      landmark={landmark}
                      city={city}
                      region={region}
                      onStreetAddressChange={
                        setStreetAddress
                      }
                      onAreaChange={
                        setArea
                      }
                      onLandmarkChange={
                        setLandmark
                      }
                      onCityChange={
                        setCity
                      }
                      onRegionChange={
                        setRegion
                      }
                    />
                  )}
                </>
              )}
            </div>

            {/* Order summary */}
            <CheckoutSummary
              cart={cart}
              deliveryFee={deliveryFee}
              total={total}
              deliveryType={deliveryType}
              placingOrder={placingOrder}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </section>
    </>
  );
}