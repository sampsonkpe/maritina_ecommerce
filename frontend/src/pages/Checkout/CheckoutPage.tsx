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
import PageContainer from "../../components/common/PageContainer";
import PageHeader from "../../components/common/PageHeader";

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
            deliveryType === DELIVERY_TYPE.DELIVERY
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

  if (!authenticated && !guestStarted) {
    return (
      <PageContainer>
        <PageHeader title="Checkout" />

        <div className="mx-auto max-w-xl rounded-md border p-8 text-center">
          <h2 className="text-2xl font-semibold">
            Continue as Guest
          </h2>

          <p className="mt-3 text-gray-600">
            Complete your purchase without creating
            an account.
          </p>

          <button
            onClick={() =>
              setGuestStarted(true)
            }
            className="mt-8 w-full rounded-md bg-black py-3 text-white"
          >
            Continue
          </button>

          <div className="my-8 text-gray-400">
            OR
          </div>

          <button
            onClick={() =>
              navigate("/login")
            }
            className="w-full rounded-md border py-3"
          >
            Log In
          </button>
        </div>
      </PageContainer>
    );
  }

  if (checkoutExpired) {
    return (
      <PageContainer>
        <PageHeader title="Checkout" />

        <div className="mx-auto max-w-xl rounded-md border p-8 text-center">
          <h2 className="text-2xl font-semibold">
            Checkout session expired
          </h2>

          <p className="mt-3 text-gray-600">
            Your checkout session expired because
            there was no activity for 30 minutes.
            Please review your cart and continue
            checkout again.
          </p>

          <button
            onClick={() =>
              navigate("/cart")
            }
            className="mt-8 w-full rounded-md bg-black py-3 text-white"
          >
            Return to Cart
          </button>
        </div>
      </PageContainer>
    );
  }

  const remainingMinutes =
    Math.ceil(remainingSeconds / 60);

  const deliveryFee =
    deliveryType === DELIVERY_TYPE.DELIVERY
      ? Number(
          cart?.delivery_fee ?? 0
        )
      : 0;

  const total =
    Number(cart?.subtotal ?? 0) +
    deliveryFee;

  return (
    <PageContainer>
      <PageHeader title="Checkout" />

      {checkoutWarning && (
        <div className="mb-6 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-800">
          Checkout will expire in{" "}
          {remainingMinutes}{" "}
          {remainingMinutes === 1
            ? "minute"
            : "minutes"}{" "}
          due to inactivity.
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">

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

        <CheckoutSummary
          cart={cart}
          deliveryFee={deliveryFee}
          total={total}
          deliveryType={deliveryType}
          placingOrder={placingOrder}
          onCheckout={handleCheckout}
        />
      </div>
    </PageContainer>
  );
}