import { createContext } from "react";

export type ToastVariant =
  | "error"
  | "success"
  | "warning"
  | "info";

export interface ToastState {
  message: string;
  variant: ToastVariant;
}

export interface ToastContextValue {
  showToast: (
    message: string,
    variant?: ToastVariant
  ) => void;
}

export const ToastContext =
  createContext<ToastContextValue | undefined>(
    undefined
  );