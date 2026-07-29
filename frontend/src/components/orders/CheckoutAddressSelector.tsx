import { ChevronDown, ChevronUp, MapPinned } from "lucide-react";
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
    (address) => address.id === selectedAddress
  );

  return (
    <div className="rounded-md border bg-white p-6 shadow-sm">

      <div className="mb-5 flex items-center gap-2">
          <MapPinned size={20} />

          <h2 className="text-xl font-semibold">
              Delivery Address
          </h2>
      </div>

              {currentAddress && (
                <div className="rounded-md border border-black bg-gray-50 p-4">

                  <p className="text-lg font-semibold">
                    {currentAddress.label}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {currentAddress.address_text}
                  </p>

                </div>
              )}

              {!currentAddress ? (
                <div className="mt-5 rounded-md border border-dashed p-6 text-center">
                  <p className="text-gray-600">
                    You don't have any saved delivery addresses.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/addresses")}
                    className="mt-4 rounded-md bg-black px-4 py-2 text-white transition hover:bg-gray-800"
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
                                onClick={() => onSelectAddress(address.id)}
                                className="block w-full rounded-md border p-4 text-left transition hover:bg-gray-50"
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
    </div>
  );
}