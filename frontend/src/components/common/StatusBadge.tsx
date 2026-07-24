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
      className={`rounded-md px-4 py-1 text-sm font-medium ${getStatusClasses(
        status
      )} ${className}`}
    >
      {formatStatus(status)}
    </span>
  );
}