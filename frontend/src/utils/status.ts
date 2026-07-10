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
      return "bg-gray-100 text-gray-700";

    case ORDER_STATUS.PREPARING:
      return "bg-blue-100 text-blue-800";

    case ORDER_STATUS.OUT_FOR_DELIVERY:
      return "bg-purple-100 text-purple-800";

    case ORDER_STATUS.DELIVERED:
      return "bg-green-100 text-green-800";

    case ORDER_STATUS.CANCELLED:
      return "bg-red-100 text-red-800";

    default:
      return "bg-gray-100 text-gray-700";
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