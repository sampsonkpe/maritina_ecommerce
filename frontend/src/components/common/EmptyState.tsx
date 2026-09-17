interface EmptyStateProps {
  title: string;
}

export default function EmptyState({
  title,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className="
        flex
        min-h-32
        items-center
        justify-center
        rounded-(--radius-md)
        border
        border-dashed
        border-(--color-border)
        bg-(--color-surface)
        p-10
        text-center
        text-sm
        text-(--color-text-muted)
      "
    >
      {title}
    </div>
  );
}