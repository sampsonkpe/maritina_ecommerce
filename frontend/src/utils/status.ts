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
        bg-neutral-200 text-neutral-800
        dark:bg-neutral-700 dark:text-neutral-300
      `;

    case ORDER_STATUS.CONFIRMED:
      return `
        bg-cyan-200 text-cyan-800
        dark:bg-cyan-900 dark:text-cyan-300
      `;

    case ORDER_STATUS.PREPARING:
      return `
        bg-blue-200 text-blue-800
        dark:bg-blue-900 dark:text-blue-300
      `;

    case ORDER_STATUS.OUT_FOR_DELIVERY:
      return `
        bg-purple-200 text-purple-800
        dark:bg-purple-900 dark:text-purple-300
      `;

    case ORDER_STATUS.READY_FOR_PICKUP:
      return `
        bg-violet-200 text-violet-800
        dark:bg-violet-900 dark:text-violet-300
      `;

    case ORDER_STATUS.DELIVERED:
      return `
        bg-green-200 text-green-800
        dark:bg-green-900 dark:text-green-300
      `;

    case ORDER_STATUS.PICKED_UP:
      return `
        bg-emerald-200 text-emerald-800
        dark:bg-emerald-900 dark:text-emerald-300
      `;

    case ORDER_STATUS.CANCELLED:
      return `
        bg-red-200 text-red-800
        dark:bg-red-900 dark:text-red-300
      `;

    default:
      return `
        bg-neutral-200 text-neutral-800
        dark:bg-neutral-700 dark:text-neutral-300
      `;
  }
}

export function getPaymentStatusClasses(
  status: string
) {
  switch (status) {
    case PAYMENT_STATUS.PENDING:
      return `
        bg-amber-200 text-amber-800
        dark:bg-amber-900 dark:text-amber-300
      `;

    case PAYMENT_STATUS.PAID:
      return `
        bg-teal-200 text-teal-800
        dark:bg-teal-900 dark:text-teal-300
      `;

    case PAYMENT_STATUS.FAILED:
      return `
        bg-red-200 text-red-800
        dark:bg-red-900 dark:text-red-300
      `;

    case PAYMENT_STATUS.REFUNDED:
      return `
        bg-indigo-200 text-indigo-800
        dark:bg-indigo-900 dark:text-indigo-300
      `;

    default:
      return `
        bg-gray-200 text-gray-800
        dark:bg-gray-700 dark:text-gray-100
      `;
  }
}