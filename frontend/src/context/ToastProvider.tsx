import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import Toast from "../components/common/Toast";

import {
  ToastContext,
  type ToastState,
  type ToastVariant,
} from "./ToastContext";

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({
  children,
}: ToastProviderProps) {
  const [toast, setToast] =
    useState<ToastState | null>(null);

  const showToast = useCallback(
    (
      message: string,
      variant: ToastVariant = "info"
    ) => {
      setToast({
        message,
        variant,
      });
    },
    []
  );

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 4000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [toast]);

  return (
    <ToastContext.Provider
      value={{ showToast }}
    >
      {children}

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </ToastContext.Provider>
  );
}