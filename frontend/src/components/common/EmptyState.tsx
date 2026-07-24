interface EmptyStateProps {
  title: string;
}

export default function EmptyState({
  title,
}: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed p-10 text-center text-gray-500">
      {title}
    </div>
  );
}