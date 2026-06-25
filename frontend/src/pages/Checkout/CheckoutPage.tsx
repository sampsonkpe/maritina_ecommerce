import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { addressService } from "../../services/addressService";
import { orderService } from "../../services/orderService";

import type { Address } from "../../types/address";

export default function CheckoutPage() {
  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [deliveryType, setDeliveryType] =
    useState("DELIVERY");

  const [selectedAddress, setSelectedAddress] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const data =
          await addressService.getAddresses();

        setAddresses(data);

        if (data.length > 0) {
          setSelectedAddress(data[0].id);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadAddresses();
  }, []);

  const handleCheckout = async () => {
    if (
      deliveryType === "DELIVERY" &&
      !selectedAddress
    ) {
      alert("Please select an address");
      return;
    }

    try {
      setLoading(true);

      await orderService.createOrder(
        deliveryType,
        deliveryType === "DELIVERY"
          ? selectedAddress!
          : undefined
      );

      navigate("/orders");
    } catch (error) {
      console.error(error);
      alert("Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-8 text-3xl font-bold">
        Checkout
      </h1>

      <div className="space-y-8">
        <div>
          <h2 className="mb-3 text-xl font-semibold">
            Delivery Method
          </h2>

          <div className="flex gap-4">
            <button
              onClick={() =>
                setDeliveryType("DELIVERY")
              }
              className={`rounded-lg border px-5 py-3 ${
                deliveryType === "DELIVERY"
                  ? "bg-black text-white"
                  : ""
              }`}
            >
              Delivery
            </button>

            <button
              onClick={() =>
                setDeliveryType("PICKUP")
              }
              className={`rounded-lg border px-5 py-3 ${
                deliveryType === "PICKUP"
                  ? "bg-black text-white"
                  : ""
              }`}
            >
              Pickup
            </button>
          </div>
        </div>

        {deliveryType === "DELIVERY" && (
          <div>
            <h2 className="mb-3 text-xl font-semibold">
              Select Address
            </h2>

            <div className="space-y-3">
              {addresses.map((address) => (
                <button
                  key={address.id}
                  onClick={() =>
                    setSelectedAddress(
                      address.id
                    )
                  }
                  className={`block w-full rounded-lg border p-4 text-left ${
                    selectedAddress === address.id
                      ? "border-black"
                      : ""
                  }`}
                >
                  <strong>
                    {address.label}
                  </strong>

                  <br />

                  {address.address_text}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="rounded-lg bg-black px-6 py-3 text-white"
        >
          {loading
            ? "Creating Order..."
            : "Place Order"}
        </button>
      </div>
    </div>
  );
}