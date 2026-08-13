import { ORDER_STATUS } from "../constants/order";
import { PAYMENT_STATUS } from "../constants/payment";

export function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getStatusClasses(
  status: string
) {
  switch (status) {
    case ORDER_STATUS.PENDING:
      return "bg-gray-200 text-gray-700";

    case ORDER_STATUS.CONFIRMED:
      return "bg-cyan-200 text-cyan-700";

    case ORDER_STATUS.PREPARING:
      return "bg-blue-200 text-blue-700";

    case ORDER_STATUS.OUT_FOR_DELIVERY:
      return "bg-purple-200 text-purple-700";

    case ORDER_STATUS.READY_FOR_PICKUP:
      return "bg-violet-200 text-violet-700";

    case ORDER_STATUS.DELIVERED:
      return "bg-green-200 text-green-700";

    case ORDER_STATUS.CANCELLED:
      return "bg-red-200 text-red-700";

    default:
      return "bg-gray-200 text-gray-700";
  }
}

export function getPaymentStatusClasses(
  status: string
) {
  switch (status) {
    case PAYMENT_STATUS.PENDING:
      return "bg-amber-100 text-amber-800";

    case PAYMENT_STATUS.PAID:
      return "bg-emerald-100 text-emerald-800";

    case PAYMENT_STATUS.FAILED:
      return "bg-red-100 text-red-800";

    case PAYMENT_STATUS.REFUNDED:
      return "bg-indigo-100 text-indigo-800";

    default:
      return "bg-gray-100 text-gray-700";
  }
}