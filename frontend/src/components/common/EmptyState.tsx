interface EmptyStateProps {
  title: string;
}

export default function EmptyState({
  title,
}: EmptyStateProps) {
  return (
    <div
      className="
        rounded-md
        border border-dashed border-(--color-border)
        p-10
        text-center text-(--color-text-muted)
      "
    >
      {title}
    </div>
  );
}