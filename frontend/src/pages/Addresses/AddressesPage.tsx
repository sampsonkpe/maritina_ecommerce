import { useEffect, useState } from "react";

import {
  Check,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { addressService } from "../../services/addressService";

import type { Address } from "../../types/address";

import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import Alert from "../../components/common/Alert";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";

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

  const [submitting, setSubmitting] =
    useState(false);

  const [actionId, setActionId] =
    useState<number | null>(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadAddresses = async () => {
      setError("");

      try {
        const data =
          await addressService.getAddresses();

        setAddresses(data);
      } catch (error) {
        console.error(error);

        setError(
          "Failed to load your addresses."
        );
      } finally {
        setLoading(false);
      }
    };

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
    setActionId(id);
    setError("");

    try {
      await addressService.setDefaultAddress(id);

      const data =
        await addressService.getAddresses();

      setAddresses(data);
    } catch (error) {
      console.error(error);

      setError(
        "Failed to update your default address."
      );
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (
    address: Address
  ) => {
    if (
      !window.confirm(
        `Delete your ${address.label} address?`
      )
    ) {
      return;
    }

    setActionId(address.id);
    setError("");

    try {
      await addressService.deleteAddress(
        address.id
      );

      setAddresses((current) =>
        current.filter(
          (item) => item.id !== address.id
        )
      );
    } catch (error) {
      console.error(error);

      setError(
        "Failed to delete this address."
      );
    } finally {
      setActionId(null);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const trimmedLabel = label.trim();
    const trimmedAddress = addressText.trim();

    if (
      !trimmedLabel ||
      !trimmedAddress
    ) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (editingId !== null) {
        await addressService.updateAddress(
          editingId,
          {
            label: trimmedLabel,
            address_text: trimmedAddress,
          }
        );
      } else {
        await addressService.createAddress(
          trimmedLabel,
          trimmedAddress
        );
      }

      const data =
        await addressService.getAddresses();

      setAddresses(data);

      resetForm();
    } catch (error) {
      console.error(error);

      setError(
        editingId !== null
          ? "Failed to update this address."
          : "Failed to save this address."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (
    address: Address
  ) => {
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
  };

  if (loading) {
    return (
      <LoadingState
        message="Loading addresses..."
      />
    );
  }

  return (
    <>
      {/* Page intro */}
      <section className="border-b border-(--color-border)">
        <div className="mx-auto flex min-h-[calc(50vh-4rem)] max-w-7xl items-center px-6 py-20 sm:px-8 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-(--color-text-muted)">
              Your Saved Places
            </p>

            <h1 className="text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
              All your addresses in one place.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-(--color-text-muted) sm:text-lg">
              Save your delivery addresses and make checking out faster and easier.
            </p>
          </div>
        </div>
      </section>

      {/* Addresses */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-8 lg:py-24">

          {error && (
            <div className="mb-8">
              <Alert message={error} />
            </div>
          )}

          <div className="mx-auto max-w-5xl">

            {/* Section heading */}
            <div className="mb-8">
              <div className="flex items-center justify-between gap-4">

                <h2 className="min-w-0 flex-1 text-4xl font-semibold leading-none tracking-tight sm:text-5xl lg:text-6xl">
                  Your addresses.
                </h2>

                <span className="shrink-0 whitespace-nowrap text-sm text-(--color-text-muted)">
                  {addresses.length}{" "}
                  {addresses.length === 1
                    ? "address"
                    : "addresses"}
                </span>

              </div>

              <div className="mt-6 flex justify-center sm:justify-end">
                {!showForm && (
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowForm(true);
                    }}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-(--color-border)
                      bg-(--color-text)
                      px-5
                      py-2.5
                      text-sm
                      font-medium
                      text-(--color-background)
                      transition-opacity
                      hover:opacity-80
                    "
                  >
                    <Plus
                      size={17}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />

                    Add New Address
                  </button>
                )}
              </div>

              <div className="mt-6 border-t border-(--color-border)" />
            </div>

            {/* Address form */}
            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="
                  mb-8
                  rounded-3xl
                  border
                  border-(--color-border)
                  bg-(--color-surface)
                  p-5
                  sm:p-6
                "
              >
                <div className="mb-6 flex items-center justify-between gap-4">
                  <h3 className="text-2xl font-semibold tracking-tight">
                    {editingId !== null
                      ? "Edit Address"
                      : "Add Address"}
                  </h3>
                </div>

                <div className="space-y-5">

                  <div>
                    <Input
                      label="Label"
                      id="address-label"
                      type="text"
                      placeholder="Home, Work, etc."
                      value={label}
                      onChange={(e) =>
                        setLabel(e.target.value)
                      }
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <Textarea
                      label="Address"
                      id="address-text"
                      placeholder="Enter your delivery address"
                      value={addressText}
                      onChange={(e) =>
                        setAddressText(e.target.value)
                      }
                      required
                      disabled={submitting}
                      rows={4}
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">

                    <button
                      type="submit"
                      disabled={submitting}
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-(--color-border)
                        bg-(--color-text)
                        px-5
                        py-3
                        text-sm
                        font-medium
                        text-(--color-background)
                        transition-opacity
                        hover:opacity-80
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      {submitting
                        ? "Saving..."
                        : editingId !== null
                          ? "Update Address"
                          : "Save Address"}
                    </button>

                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={submitting}
                      className="
                        inline-flex
                        items-center
                        rounded-full
                        border
                        border-(--color-border)
                        px-5
                        py-3
                        text-sm
                        font-medium
                        transition-colors
                        hover:bg-(--color-surface-muted)
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      Cancel
                    </button>

                  </div>
                </div>
              </form>
            )}

            {/* Address list */}
            {addresses.length === 0 ? (
              <EmptyState
                title="No addresses saved yet."
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {addresses.map((address) => {
                  const isActing =
                    actionId === address.id;

                  return (
                    <article
                      key={address.id}
                      className="
                        rounded-3xl
                        border
                        border-(--color-border)
                        bg-(--color-surface)
                        p-5
                        sm:p-6
                      "
                    >
                      <div className="min-h-0">

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-3">

                            <h3 className="text-xl font-semibold tracking-tight">
                              {address.label}
                            </h3>

                            {address.is_default && (
                              <span
                                className="
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  rounded-full
                                  border
                                  border-(--color-border)
                                  px-3
                                  py-1
                                  text-xs
                                  font-medium
                                  text-green-500
                                "
                              >
                                <Check
                                  size={13}
                                  strokeWidth={2}
                                  aria-hidden="true"
                                />

                                Default
                              </span>
                            )}

                          </div>

                          <p className="mt-3 text-sm leading-6 text-(--color-text-muted)">
                            {address.address_text}
                          </p>

                        </div>

                      </div>

                      <div
                        className={`
                          mt-6
                          flex
                          flex-wrap
                          items-center
                          gap-3
                          ${
                            address.is_default
                              ? "justify-start"
                              : "justify-between"
                          }
                        `}
                      >

                        {!address.is_default && (
                          <button
                            type="button"
                            disabled={isActing}
                            onClick={() =>
                              handleSetDefault(
                                address.id
                              )
                            }
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-full
                              border
                              border-(--color-border)
                              px-4
                              py-2.5
                              text-sm
                              font-medium
                              transition-colors
                              hover:bg-(--color-surface-muted)
                              disabled:cursor-not-allowed
                              disabled:opacity-40
                            "
                          >
                            <Check
                              size={16}
                              strokeWidth={1.8}
                              aria-hidden="true"
                            />

                            {isActing
                              ? "Updating..."
                              : "Set Default"}
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() =>
                            handleEdit(address)
                          }
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-(--color-border)
                            px-4
                            py-2.5
                            text-sm
                            font-medium
                            transition-colors
                            hover:bg-(--color-surface-muted)
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                          "
                        >
                          <Pencil
                            size={16}
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />

                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={isActing}
                          onClick={() =>
                            handleDelete(address)
                          }
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            border
                            border-(--color-border)
                            px-4
                            py-2.5
                            text-sm
                            font-medium
                            text-red-500
                            transition-opacity
                            hover:opacity-60
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                          "
                        >
                          <Trash2
                            size={16}
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />

                          {isActing
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>
                    </article>
                  );
                })}

              </div>
            )}

          </div>
        </div>
      </section>
    </>
  );
}