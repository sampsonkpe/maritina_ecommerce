import { useEffect, useState } from "react";

import { addressService } from "../../services/addressService";

import type { Address } from "../../types/address";

export default function AddressesPage() {
  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [label, setLabel] =
    useState("");

  const [addressText, setAddressText] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const loadAddresses = async () => {
    try {
      const data =
        await addressService.getAddresses();

      setAddresses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      await addressService.createAddress(
        label,
        addressText
      );

      setLabel("");
      setAddressText("");

      loadAddresses();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        Loading addresses...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-8">

      <h1 className="mb-8 text-3xl font-bold">
        My Addresses
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mb-10 space-y-4"
      >
        <input
          type="text"
          placeholder="Home, Work, etc."
          value={label}
          onChange={(e) =>
            setLabel(e.target.value)
          }
          className="w-full rounded border p-3"
        />

        <textarea
          placeholder="Enter address"
          value={addressText}
          onChange={(e) =>
            setAddressText(
              e.target.value
            )
          }
          className="w-full rounded border p-3"
          rows={4}
        />

        <button
          type="submit"
          className="rounded bg-black px-5 py-3 text-white"
        >
          Save Address
        </button>
      </form>

      <div className="space-y-4">

        {addresses.length === 0 ? (
          <p>No addresses found.</p>
        ) : (
          addresses.map((address) => (
            <div
              key={address.id}
              className="rounded border p-4"
            >
              <h2 className="font-semibold">
                {address.label}
              </h2>

              <p className="mt-2">
                {address.address_text}
              </p>
            </div>
          ))
        )}

      </div>

    </div>
  );
}