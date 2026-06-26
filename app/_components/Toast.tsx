"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Icon } from "./Icon";

type ToastVariant = "error" | "success" | "info";

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  notify: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 6000;

const VARIANT_STYLES: Record<
  ToastVariant,
  { wrap: string; icon: string; iconName: string }
> = {
  error: {
    wrap: "border-error/30 bg-error-container text-on-error-container",
    icon: "text-error",
    iconName: "error",
  },
  success: {
    wrap: "border-primary/30 bg-primary-container text-on-primary-container",
    icon: "text-primary",
    iconName: "check_circle",
  },
  info: {
    wrap: "border-outline-variant bg-surface-container text-on-surface",
    icon: "text-on-surface-variant",
    iconName: "info",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-[min(360px,calc(100vw-2rem))]">
        {toasts.map((toast) => {
          const styles = VARIANT_STYLES[toast.variant];
          return (
            <div
              key={toast.id}
              role="alert"
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${styles.wrap}`}
            >
              <Icon
                name={styles.iconName}
                className={`text-[20px] shrink-0 mt-0.5 ${styles.icon}`}
              />
              <p className="flex-1 font-body-sm text-body-sm leading-snug whitespace-pre-line">
                {toast.message}
              </p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Dismiss"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
