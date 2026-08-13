import { ORDER_STATUS } from "../constants/order";
import { PAYMENT_STATUS } from "../constants/payment";

export function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

export function getStatusClasses(
  status: string
) {
  switch (status) {
    case ORDER_STATUS.PENDING:
      return `
        bg-gray-200 text-gray-800
        dark:bg-gray-700 dark:text-gray-100
      `;

    case ORDER_STATUS.CONFIRMED:
      return `
        bg-cyan-100 text-cyan-800
        dark:bg-cyan-950 dark:text-cyan-200
      `;

    case ORDER_STATUS.PREPARING:
      return `
        bg-blue-100 text-blue-800
        dark:bg-blue-950 dark:text-blue-200
      `;

    case ORDER_STATUS.OUT_FOR_DELIVERY:
      return `
        bg-purple-100 text-purple-800
        dark:bg-purple-950 dark:text-purple-200
      `;

    case ORDER_STATUS.READY_FOR_PICKUP:
      return `
        bg-violet-100 text-violet-800
        dark:bg-violet-950 dark:text-violet-200
      `;

    case ORDER_STATUS.DELIVERED:
      return `
        bg-green-100 text-green-800
        dark:bg-green-950 dark:text-green-200
      `;

    case ORDER_STATUS.PICKED_UP:
      return `
        bg-emerald-100 text-emerald-800
        dark:bg-emerald-950 dark:text-emerald-200
      `;

    case ORDER_STATUS.CANCELLED:
      return `
        bg-red-100 text-red-800
        dark:bg-red-950 dark:text-red-200
      `;

    default:
      return `
        bg-gray-200 text-gray-800
        dark:bg-gray-700 dark:text-gray-100
      `;
  }
}

export function getPaymentStatusClasses(
  status: string
) {
  switch (status) {
    case PAYMENT_STATUS.PENDING:
      return `
        bg-amber-100 text-amber-800
        dark:bg-amber-950 dark:text-amber-200
      `;

    case PAYMENT_STATUS.PAID:
      return `
        bg-teal-100 text-teal-800
        dark:bg-teal-950 dark:text-teal-200
      `;

    case PAYMENT_STATUS.FAILED:
      return `
        bg-red-100 text-red-800
        dark:bg-red-950 dark:text-red-200
      `;

    case PAYMENT_STATUS.REFUNDED:
      return `
        bg-indigo-100 text-indigo-800
        dark:bg-indigo-950 dark:text-indigo-200
      `;

    default:
      return `
        bg-gray-200 text-gray-800
        dark:bg-gray-700 dark:text-gray-100
      `;
  }
}