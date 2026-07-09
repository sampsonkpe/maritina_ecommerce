export const ORDER_STATUS = {
  PENDING: "PENDING",
  PREPARING: "PREPARING",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

export const PAYMENT_STATUS_OPTIONS = [
  { value: PAYMENT_STATUS.PENDING, label: "Pending" },
  { value: PAYMENT_STATUS.PAID, label: "Paid" },
  { value: PAYMENT_STATUS.FAILED, label: "Failed" },
  { value: PAYMENT_STATUS.REFUNDED, label: "Refunded" },
];

export const DELIVERY_TYPE = {
  DELIVERY: "DELIVERY",
  PICKUP: "PICKUP",
} as const;

export const ORDER_STATUS_OPTIONS = [
  {
    value: ORDER_STATUS.PENDING,
    label: "Pending",
  },
  {
    value: ORDER_STATUS.PREPARING,
    label: "Preparing",
  },
  {
    value: ORDER_STATUS.OUT_FOR_DELIVERY,
    label: "Out for Delivery",
  },
  {
    value: ORDER_STATUS.DELIVERED,
    label: "Delivered",
  },
  {
    value: ORDER_STATUS.CANCELLED,
    label: "Cancelled",
  },
];