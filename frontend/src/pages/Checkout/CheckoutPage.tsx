import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { addressService } from "../../services/addressService";
import { orderService } from "../../services/orderService";
import { cartService } from "../../services/cartService";

import type { Address } from "../../types/address";
import type { Cart } from "../../types/cart";
import {
  DELIVERY_TYPE,
  type DeliveryType,
} from "../../constants/order";

import Alert from "../../components/common/Alert";
import LoadingState from "../../components/common/LoadingState";
import PageContainer from "../../components/common/PageContainer";
import PageHeader from "../../components/common/PageHeader";

import CheckoutSummary from "../../components/orders/CheckoutSummary";
import CheckoutAddressSelector from "../../components/orders/CheckoutAddressSelector";

export default function CheckoutPage() {
  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [deliveryType, setDeliveryType] =
    useState<DeliveryType>(DELIVERY_TYPE.DELIVERY);

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

  const [error, setError] =
    useState("");

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
        setError(
          "Failed to load checkout. Please try again."
        );
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCheckout = async () => {
    setError("");

    if (
      deliveryType === DELIVERY_TYPE.DELIVERY &&
      !selectedAddress
    ) {
      setError(
        "Please select a delivery address."
      );
      return;
    }

    try {
      setPlacingOrder(true);

      await orderService.createOrder(
        deliveryType,
        deliveryType === DELIVERY_TYPE.DELIVERY
          ? selectedAddress!
          : undefined
      );

      navigate("/orders");
    } catch (error) {
      console.error(error);
      setError("Failed to create order.");
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

  const deliveryFee =
    deliveryType === DELIVERY_TYPE.DELIVERY
      ? Number(cart?.delivery_fee ?? 0)
      : 0;

  const total =
    Number(cart?.subtotal ?? 0) +
    deliveryFee;

  return (
    <PageContainer>
      <PageHeader title="Checkout" />
      {error && <Alert message={error} />}

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">

        {/* LEFT COLUMN */}

        <CheckoutAddressSelector
          addresses={addresses}
          deliveryType={deliveryType}
          selectedAddress={selectedAddress}
          showAddresses={showAddresses}
          onDeliveryTypeChange={setDeliveryType}
          onSelectAddress={(id) => {
            setSelectedAddress(id);
            setShowAddresses(false);
          }}
          onToggleAddresses={() =>
            setShowAddresses((prev) => !prev)
          }
        />

        {/* RIGHT COLUMN */}

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