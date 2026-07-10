interface PageHeaderProps {
  title: string;
  className?: string;
}

export default function PageHeader({
  title,
  className = "",
}: PageHeaderProps) {
  return (
    <h1
      className={`mb-8 text-3xl font-bold ${className}`}
    >
      {title}
    </h1>
  );
}