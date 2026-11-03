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


export function getStatusClasses(status: string) {
  switch (status) {
    case ORDER_STATUS.PENDING:
      return `
        border border-(--color-border)
        bg-(--color-surface-muted)
        text-(--color-text-muted)
      `;

    case ORDER_STATUS.CONFIRMED:
      return `
        border border-cyan-300
        bg-cyan-100
        text-cyan-800
        dark:border-cyan-800
        dark:bg-cyan-950
        dark:text-cyan-300
      `;

    case ORDER_STATUS.PREPARING:
      return `
        border border-blue-300
        bg-blue-100
        text-blue-800
        dark:border-blue-800
        dark:bg-blue-950
        dark:text-blue-300
      `;

    case ORDER_STATUS.OUT_FOR_DELIVERY:
      return `
        border border-purple-300
        bg-purple-100
        text-purple-800
        dark:border-purple-800
        dark:bg-purple-950
        dark:text-purple-300
      `;

    case ORDER_STATUS.READY_FOR_PICKUP:
      return `
        border border-violet-300
        bg-violet-100
        text-violet-800
        dark:border-violet-800
        dark:bg-violet-950
        dark:text-violet-300
      `;

    case ORDER_STATUS.DELIVERED:
      return `
        border border-green-300
        bg-green-100
        text-green-800
        dark:border-green-800
        dark:bg-green-950
        dark:text-green-300
      `;

    case ORDER_STATUS.PICKED_UP:
      return `
        border border-emerald-300
        bg-emerald-100
        text-emerald-800
        dark:border-emerald-800
        dark:bg-emerald-950
        dark:text-emerald-300
      `;

    case ORDER_STATUS.CANCELLED:
      return `
        border border-red-300
        bg-red-100
        text-red-800
        dark:border-red-800
        dark:bg-red-950
        dark:text-red-300
      `;

    default:
      return `
        border border-(--color-border)
        bg-(--color-surface-muted)
        text-(--color-text-muted)
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