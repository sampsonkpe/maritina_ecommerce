export const ORDER_STATUS = {
  PENDING: "PENDING",
  PREPARING: "PREPARING",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

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

export const ORDER_STATUS_TRANSITIONS = {
  PENDING: [
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.CANCELLED,
  ],

  PREPARING: [
    ORDER_STATUS.OUT_FOR_DELIVERY,
    ORDER_STATUS.CANCELLED,
  ],

  OUT_FOR_DELIVERY: [
    ORDER_STATUS.DELIVERED,
  ],

  DELIVERED: [],

  CANCELLED: [],
} as const;