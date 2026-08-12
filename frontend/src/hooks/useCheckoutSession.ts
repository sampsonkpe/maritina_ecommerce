import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  CHECKOUT_SESSION_DURATION,
  CHECKOUT_WARNING_DURATION,
} from "../constants/checkout";

interface CheckoutSessionState {
  expired: boolean;
  warning: boolean;
  remainingSeconds: number;
}

export function useCheckoutSession(
  enabled: boolean
): CheckoutSessionState {
  const [expired, setExpired] =
    useState(false);

  const [remainingSeconds, setRemainingSeconds] =
    useState(
      Math.floor(
        CHECKOUT_SESSION_DURATION / 1000
      )
    );

  const lastActivity =
    useRef<number | null>(null);

  const resetActivity = useCallback(() => {
    if (expired) {
      return;
    }

    lastActivity.current = Date.now();

    setRemainingSeconds(
      Math.floor(
        CHECKOUT_SESSION_DURATION / 1000
      )
    );
  }, [expired]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (lastActivity.current === null) {
      lastActivity.current = Date.now();
    }

    const handleActivity = () => {
      resetActivity();
    };

    const events = [
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "input",
      "change",
    ];

    events.forEach((event) => {
      window.addEventListener(
        event,
        handleActivity
      );
    });

    const interval = window.setInterval(() => {
      if (lastActivity.current === null) {
        return;
      }

      const elapsed =
        Date.now() - lastActivity.current;

      const remaining =
        CHECKOUT_SESSION_DURATION - elapsed;

      if (remaining <= 0) {
        setRemainingSeconds(0);
        setExpired(true);

        return;
      }

      setRemainingSeconds(
        Math.ceil(remaining / 1000)
      );
    }, 1000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(
          event,
          handleActivity
        );
      });

      window.clearInterval(interval);
    };
  }, [enabled, resetActivity]);

  const warning =
    !expired &&
    remainingSeconds <=
      CHECKOUT_WARNING_DURATION / 1000;

  return {
    expired,
    warning,
    remainingSeconds,
  };
}