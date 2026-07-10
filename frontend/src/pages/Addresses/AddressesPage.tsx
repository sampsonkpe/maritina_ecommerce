import { useEffect, useState } from "react";

import { addressService } from "../../services/addressService";

import type { Address } from "../../types/address";

import LoadingState from "../../components/common/LoadingState";

export default function AddressesPage() {
  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [showForm, setShowForm] =
    useState(false);

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

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
    setLabel("");
    setAddressText("");
  };

  const handleSetDefault = async (
    id: number
  ) => {
    try {
      await addressService.setDefaultAddress(
        id
      );

      loadAddresses();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (
    id: number
  ) => {
    if (
      !window.confirm(
        "Delete this address?"
      )
    ) {
      return;
    }

    try {
      await addressService.deleteAddress(
        id
      );

      loadAddresses();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      if (editingId) {
        await addressService.updateAddress(
          editingId,
          {
            label,
            address_text: addressText,
          }
        );
      } else {
        await addressService.createAddress(
          label,
          addressText
        );
      }

      resetForm();

      loadAddresses();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <LoadingState
        message="Loading orders..."
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-8">

      <div className="mb-8 flex items-center justify-between">

        <h1 className="text-3xl font-bold">
          My Addresses
        </h1>

        {!showForm && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="rounded-lg bg-black px-5 py-3 text-white transition hover:bg-gray-800"
          >
            + Add Address
          </button>
        )}

      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-10 rounded-lg border bg-white p-6 shadow-sm"
        >

          <h2 className="mb-5 text-xl font-semibold">
            {editingId
              ? "Edit Address"
              : "Add Address"}
          </h2>

          <div className="space-y-4">

            <input
              type="text"
              placeholder="Home, Work, etc."
              value={label}
              onChange={(e) =>
                setLabel(e.target.value)
              }
              className="w-full rounded-lg border p-3"
              required
            />

            <textarea
              placeholder="Enter address"
              value={addressText}
              onChange={(e) =>
                setAddressText(
                  e.target.value
                )
              }
              className="w-full rounded-lg border p-3"
              rows={4}
              required
            />

            <div className="flex gap-3">

              <button
                type="submit"
                className="rounded-lg bg-black px-5 py-3 text-white transition hover:bg-gray-800"
              >
                {editingId
                  ? "Update Address"
                  : "Save Address"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border px-5 py-3 transition hover:bg-gray-50"
              >
                Cancel
              </button>

            </div>

          </div>

        </form>
      )}

      <div className="space-y-4">

        {addresses.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center text-gray-500">
            You haven't added any delivery addresses yet.
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address.id}
              className="rounded-lg border bg-white p-5 shadow-sm"
            >

              <div className="flex items-start justify-between">

                <div>

                  <h2 className="text-xl font-semibold">
                    {address.label}
                  </h2>

                  <p className="mt-2 text-gray-600">
                    {address.address_text}
                  </p>

                </div>

                {address.is_default && (
                  <span className="rounded-lg bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Default
                  </span>
                )}

              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {!address.is_default && (
                  <button
                    type="button"
                    onClick={() =>
                      handleSetDefault(address.id)
                    }
                    className="rounded-lg border px-4 py-2 text-sm transition hover:bg-gray-50"
                  >
                    Set Default
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setEditingId(address.id);
                    setLabel(address.label);
                    setAddressText(
                      address.address_text
                    );
                    setShowForm(true);

                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  className="rounded-lg border px-4 py-2 text-sm transition hover:bg-gray-50"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(address.id)
                  }
                  className="rounded-lg border border-red-400 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
                >
                  Delete
                </button>

              </div>

            </div>
          ))
        )}

      </div>

    </div>
  );
}