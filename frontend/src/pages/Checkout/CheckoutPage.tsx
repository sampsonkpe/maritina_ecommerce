import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  MapPinned,
} from "lucide-react";

import { addressService } from "../../services/addressService";
import { orderService } from "../../services/orderService";
import { cartService } from "../../services/cartService";

import type { Address } from "../../types/address";
import type { Cart } from "../../types/cart";

import { formatCurrency } from "../../utils/currency";

export default function CheckoutPage() {
  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [deliveryType, setDeliveryType] =
    useState("DELIVERY");

  const [selectedAddress, setSelectedAddress] =
    useState<number | null>(null);
  
  const [showAddresses, setShowAddresses] =
  useState(false);

  const [cart, setCart] =
    useState<Cart | null>(null);

  const [pageLoading, setPageLoading] =
    useState(true);

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          addressesData,
          cartData,
        ] = await Promise.all([
          addressService.getAddresses(),
          cartService.getCart(),
        ]);

        setAddresses(addressesData);
        setCart(cartData);

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
      } catch (error) {
        console.error(error);
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCheckout = async () => {
    if (
      deliveryType === "DELIVERY" &&
      !selectedAddress
    ) {
      alert(
        "Please select an address."
      );
      return;
    }

    try {
      setPlacingOrder(true);

      await orderService.createOrder(
        deliveryType,
        deliveryType === "DELIVERY"
          ? selectedAddress!
          : undefined
      );

      navigate("/orders");
    } catch (error) {
      console.error(error);
      alert("Failed to create order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="p-8">
        Loading checkout...
      </div>
    );
  }

  const deliveryFee =
    deliveryType === "DELIVERY"
      ? Number(cart?.delivery_fee ?? 0)
      : 0;

  const total =
    Number(cart?.subtotal ?? 0) +
    deliveryFee;

  const currentAddress =
  addresses.find(
    (address) =>
      address.id === selectedAddress
  );

  return (
    <div className="mx-auto max-w-7xl p-8">
      <h1 className="mb-8 text-3xl font-bold">
        Checkout
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">

        {/* LEFT COLUMN */}

        <div className="rounded-lg border bg-white p-6 shadow-sm">

          <h2 className="mb-5 text-xl font-semibold">
            Delivery Method
          </h2>

          <div className="flex gap-4">

            <button
              type="button"
              onClick={() =>
                setDeliveryType(
                  "DELIVERY"
                )
              }
              className={`rounded-lg border px-5 py-3 transition ${
                deliveryType ===
                "DELIVERY"
                  ? "bg-black text-white"
                  : "hover:bg-gray-50"
              }`}
            >
              Delivery
            </button>

            <button
              type="button"
              onClick={() =>
                setDeliveryType(
                  "PICKUP"
                )
              }
              className={`rounded-lg border px-5 py-3 transition ${
                deliveryType ===
                "PICKUP"
                  ? "bg-black text-white"
                  : "hover:bg-gray-50"
              }`}
            >
              Pickup
            </button>

          </div>

          {deliveryType ===
            "DELIVERY" && (
            <>

              <div className="my-8 border-t" />

              <div className="mb-5 flex items-center gap-2">
                <MapPinned size={20} />
                
                <h2 className="text-xl font-semibold">
                  Delivery Address
                </h2>
              </div>

              {currentAddress && (
                <div className="rounded-lg border border-black bg-gray-50 p-4">

                  <p className="text-lg font-semibold">
                    {currentAddress.label}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {currentAddress.address_text}
                  </p>

                </div>
              )}

              {!currentAddress ? (
                <div className="mt-5 rounded-lg border border-dashed p-6 text-center">
                  <p className="text-gray-600">
                    You don't have any saved delivery addresses.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/addresses")}
                    className="mt-4 rounded-lg bg-black px-4 py-2 text-white transition hover:bg-gray-800"
                  >
                    Manage Addresses
                  </button>
                </div>
              ) : (
                <>
                  {addresses.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setShowAddresses(!showAddresses)
                        }
                        className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-black"
                      >
                        {showAddresses ? (
                          <>
                            Hide Addresses
                            <ChevronUp size={16} />
                          </>
                        ) : (
                          <>
                            Change Address
                            <ChevronDown size={16} />
                          </>
                        )}
                      </button>

                      {showAddresses && (
                        <div className="mt-5 space-y-3">
                          {addresses
                            .filter(
                              (address) =>
                                address.id !==
                                selectedAddress
                            )
                            .map((address) => (
                              <button
                                key={address.id}
                                type="button"
                                onClick={() => {
                                  setSelectedAddress(
                                    address.id
                                  );

                                  setShowAddresses(
                                    false
                                  );
                                }}
                                className="block w-full rounded-lg border p-4 text-left transition hover:bg-gray-50"
                              >
                                <p className="font-semibold">
                                  {address.label}
                                </p>

                                <p className="mt-1 text-sm leading-6 text-gray-600">
                                  {address.address_text}
                                </p>
                              </button>
                            ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}

        </div>

        {/* RIGHT COLUMN */}

        <div className="rounded-lg border bg-white p-6 shadow-sm lg:sticky lg:top-8 lg:self-start">

          <h2 className="mb-5 text-xl font-semibold">
            Order Summary
          </h2>

          {cart?.items.map((item) => (
            <div
              key={item.id}
              className="mb-4 border-b pb-4 last:mb-0 last:border-b-0"
            >
              <p className="font-medium">
                {item.product_name}
              </p>

              <p className="text-sm text-gray-500">
                {item.variant_name}
              </p>

              <div className="mt-2 flex justify-between text-sm">

                <span>
                  Qty: {item.quantity}
                </span>

                <span className="font-medium">
                  {formatCurrency(item.subtotal)}
                </span>

              </div>

            </div>
          ))}

          <div className="mt-6 space-y-3 border-t pt-4">

            <div className="flex justify-between">
              <span>
                Subtotal
              </span>

              <span>
                {formatCurrency(cart?.subtotal ?? 0)}
              </span>
            </div>

            {deliveryType ===
              "DELIVERY" && (
              <div className="flex justify-between">
                <span>
                  Delivery Fee
                </span>

                <span>
                  {formatCurrency(deliveryFee)}
                </span>
              </div>
            )}

            <div className="flex justify-between border-t pt-3 text-lg font-semibold">

              <span>Total</span>

              <span>
                {formatCurrency(total)}
              </span>

            </div>

          </div>

          <button
            type="button"
            onClick={
              handleCheckout
            }
            disabled={
              placingOrder
            }
            className="mt-6 w-full rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {placingOrder
              ? "Creating Order..."
              : "Place Order"}
          </button>

        </div>

      </div>
    </div>
  );
}