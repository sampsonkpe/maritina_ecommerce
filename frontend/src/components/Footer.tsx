export default function Footer() {
  return (
    <footer className="border-t border-(--color-border)">
      <div
        className="
          mx-auto
          max-w-7xl
          px-(--spacing-page)
          py-6
          text-center
          text-sm
          text-(--color-text-muted)
        "
      >
        © {new Date().getFullYear()} KAHWƐ by Maritina Foods
      </div>
    </footer>
  );
}