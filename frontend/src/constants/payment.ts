export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

export const PAYMENT_STATUS_OPTIONS = [
  {
    value: PAYMENT_STATUS.PENDING,
    label: "Pending",
  },
  {
    value: PAYMENT_STATUS.PAID,
    label: "Paid",
  },
  {
    value: PAYMENT_STATUS.FAILED,
    label: "Failed",
  },
  {
    value: PAYMENT_STATUS.REFUNDED,
    label: "Refunded",
  },
];