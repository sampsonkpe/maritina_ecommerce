import Input from "../common/Input";

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
    <section className="rounded-(--radius-lg) border border-(--color-border) bg-(--color-surface) p-6">
      <h2 className="text-center text-xl font-semibold tracking-tight sm:text-2xl">
        Contact Information
      </h2>

      <p className="mt-2 text-sm text-(--color-text-muted)">
        We'll use these details to send order updates and
        contact you if needed.
      </p>

      <div className="mt-6 space-y-5">
        <Input
          label="Full Name"
          type="text"
          value={fullName}
          onChange={(e) =>
            onFullNameChange(e.target.value)
          }
          placeholder="Enter your full name"
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) =>
            onPhoneChange(e.target.value)
          }
          placeholder="Enter your phone number"
          required
        />

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) =>
            onEmailChange(e.target.value)
          }
          placeholder="Enter your email address"
          required
        />
      </div>
    </section>
  );
}