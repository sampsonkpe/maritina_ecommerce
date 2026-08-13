export default function Footer() {
  return (
    <footer className="mt-20 border-t border-(--color-border)">
      <div className="mx-auto max-w-7xl p-4 text-center text-(--color-text-muted)">
        © {new Date().getFullYear()} KAHWƐ by Maritina Foods
      </div>
    </footer>
  );
}