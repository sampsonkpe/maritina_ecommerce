import Input from "../common/Input";

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
    <section className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-6">
      <h2 className="text-center text-xl font-semibold tracking-tight sm:text-2xl">
        Delivery Address
      </h2>

      <p className="mt-2 text-sm text-(--color-text-muted)">
        Tell us where you'd like your order delivered.
      </p>

      <div className="mt-6 space-y-5">
        <Input
          label="Street Address"
          type="text"
          value={streetAddress}
          onChange={(e) =>
            onStreetAddressChange(e.target.value)
          }
          placeholder="Enter your street address"
          required
        />

        <Input
          label="Area / Neighbourhood"
          type="text"
          value={area}
          onChange={(e) =>
            onAreaChange(e.target.value)
          }
          placeholder="Enter your area / neighbourhood"
          required
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="City"
            type="text"
            value={city}
            onChange={(e) =>
              onCityChange(e.target.value)
            }
            placeholder="Enter your city name"
            required
          />

          <Input
            label="Region"
            type="text"
            value={region}
            onChange={(e) =>
              onRegionChange(e.target.value)
            }
            placeholder="Enter your region"
            required
          />

          <Input
            label="Landmark"
            type="text"
            value={landmark}
            onChange={(e) =>
              onLandmarkChange(e.target.value)
            }
            placeholder="Enter a landmark"
          />
        </div>
      </div>
    </section>
  );
}