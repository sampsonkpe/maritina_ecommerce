type AddressFormProps = {
  streetAddress: string;
  area: string;
  landmark: string;
  city: string;
  region: string;

  onStreetAddressChange: (value: string) => void;
  onAreaChange: (value: string) => void;
  onLandmarkChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onRegionChange: (value: string) => void;
};

export default function AddressForm({
  streetAddress,
  area,
  landmark,
  city,
  region,
  onStreetAddressChange,
  onAreaChange,
  onLandmarkChange,
  onCityChange,
  onRegionChange,
}: AddressFormProps) {
  return (
    <section className="rounded-md border bg-white p-6 shadow-sm">

      <h2 className="text-xl font-semibold">
        Delivery Address
      </h2>

      <p className="mt-2 text-sm text-gray-600">
        Tell us where you'd like your order delivered.
      </p>

      <div className="mt-6 space-y-5">

        <div>
          <label className="mb-2 block font-medium">
            Street Address
          </label>

          <input
            type="text"
            value={streetAddress}
            onChange={(e) =>
              onStreetAddressChange(e.target.value)
            }
            className="w-full rounded-md border px-4 py-3"
            placeholder="Enter your street address"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Area / Neighbourhood
          </label>

          <input
            type="text"
            value={area}
            onChange={(e) =>
              onAreaChange(e.target.value)
            }
            className="w-full rounded-md border px-4 py-3"
            placeholder="Enter your area / neighbourhood"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">

          <div>
            <label className="mb-2 block font-medium">
              City
            </label>

            <input
              type="text"
              value={city}
              onChange={(e) =>
                onCityChange(e.target.value)
              }
              className="w-full rounded-md border px-4 py-3"
              placeholder="Enter your city name"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Region
            </label>

            <input
              type="text"
              value={region}
              onChange={(e) =>
                onRegionChange(e.target.value)
              }
              className="w-full rounded-md border px-4 py-3"
              placeholder="Enter your region"
            />
          </div>

          <div>
               <label className="mb-2 block font-medium">
               Landmark (Optional)
               </label>

               <input
               type="text"
               value={landmark}
               onChange={(e) =>
               onLandmarkChange(e.target.value)
               }
               className="w-full rounded-md border px-4 py-3"
               placeholder="Enter a landmark"
               />
          </div>

        </div>

      </div>

    </section>
  );
}