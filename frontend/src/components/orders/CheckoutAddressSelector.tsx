import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { Address } from "../../types/address";

interface CheckoutAddressSelectorProps {
  addresses: Address[];
  selectedAddress: number | null;
  showAddresses: boolean;
  onSelectAddress: (id: number) => void;
  onToggleAddresses: () => void;
}

export default function CheckoutAddressSelector({
  addresses,
  selectedAddress,
  showAddresses,
  onSelectAddress,
  onToggleAddresses,
}: CheckoutAddressSelectorProps) {
  const navigate = useNavigate();

  const currentAddress = addresses.find(
    (address) =>
      address.id === selectedAddress
  );

  return (
    <section className="rounded-(--radius-lg) border border-(--color-border) p-5 sm:p-6 lg:sticky lg:top-8">
        <h2 className="mb-5 text-xl text-center font-semibold tracking-tight sm:text-2xl">
          Delivery Address
        </h2>

      {currentAddress && (
        <div className="rounded-(--radius-md) border border-(--color-border) p-4">
          <p className="font-semibold">
            {currentAddress.label}
          </p>

          <p className="mt-1 text-sm leading-6 text-(--color-text-muted)">
            {currentAddress.address_text}
          </p>
        </div>
      )}

      {!currentAddress ? (
        <div className="rounded-(--radius-md) border border-dashed border-(--color-border) p-6 text-center">
          <p className="text-sm leading-6 text-(--color-text-muted)">
            You don't have any saved delivery
            addresses.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/addresses")
            }
            className="mt-5 inline-flex items-center justify-center rounded-full border border-(--color-border) px-5 py-2.5 text-sm font-medium transition-colors hover:bg-(--color-surface-muted)"
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
                aria-expanded={showAddresses}
                onClick={onToggleAddresses}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-(--color-text-muted) transition-opacity hover:opacity-60"
              >
                {showAddresses ? (
                  <>
                    Hide Addresses
                    <ChevronUp
                      size={16}
                      aria-hidden="true"
                    />
                  </>
                ) : (
                  <>
                    Change Address
                    <ChevronDown
                      size={16}
                      aria-hidden="true"
                    />
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
                        onClick={() =>
                          onSelectAddress(
                            address.id
                          )
                        }
                        className="
                          block
                          w-full
                          rounded-(--radius-md)
                          border
                          border-(--color-border)
                          p-4
                          text-left
                          transition-colors
                          hover:bg-(--color-surface-muted)
                          focus-visible:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-(--color-accent)
                          focus-visible:ring-offset-2
                          focus-visible:ring-offset-(--color-background)
                        "
                      >
                        <p className="font-semibold">
                          {address.label}
                        </p>

                        <p className="mt-1 text-sm leading-6 text-(--color-text-muted)">
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
    </section>
  );
}