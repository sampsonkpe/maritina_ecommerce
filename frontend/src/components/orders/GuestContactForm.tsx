type GuestContactFormProps = {
  fullName: string;
  email: string;
  phone: string;
  onFullNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
};

export default function GuestContactForm({
  fullName,
  email,
  phone,
  onFullNameChange,
  onEmailChange,
  onPhoneChange,
}: GuestContactFormProps) {
  return (
    <section className="rounded-md border p-6">

      <h2 className="text-xl font-semibold">
        Contact Information
      </h2>

      <p className="text-sm text-gray-500">
        We'll use these details to send order updates and contact you if needed.
      </p>

      <div className="mt-6 space-y-5">

        <div>
          <label className="mb-2 block font-medium">
            Full Name
          </label>

          <input
            type="text"
            value={fullName}
            onChange={(e) =>
              onFullNameChange(e.target.value)
            }
            className="w-full rounded-md border px-4 py-3"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Phone Number
          </label>

          <input
            type="tel"
            value={phone}
            onChange={(e) =>
              onPhoneChange(e.target.value)
            }
            className="w-full rounded-md border px-4 py-3"
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Email Address
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              onEmailChange(e.target.value)
            }
            className="w-full rounded-md border px-4 py-3"
            placeholder="Enter your email address"
          />
        </div>

      </div>

    </section>
  );
}