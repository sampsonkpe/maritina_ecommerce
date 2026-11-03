import {
  formatStatus,
  getStatusClasses,
} from "../../utils/status";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({
  status,
  className = "",
}: StatusBadgeProps) {
  return (
    <span
      className={`
        inline-flex
        min-h-7
        items-center
        justify-center
        whitespace-nowrap
        rounded-(--radius-full)
        px-3
        py-1
        text-xs
        font-medium
        leading-none
        ${getStatusClasses(status)}
        ${className}
      `}
    >
      {formatStatus(status)}
    </span>
  );
}