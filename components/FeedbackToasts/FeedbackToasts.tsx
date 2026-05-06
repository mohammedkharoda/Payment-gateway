"use client";

import { ToastItem } from "./ToastItem";
import type { FeedbackToast } from "./types";

interface FeedbackToastsProps {
  toasts: FeedbackToast[];
  onDismiss: (id: string) => void;
}

export function FeedbackToasts({ toasts, onDismiss }: FeedbackToastsProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col gap-3 sm:inset-x-auto sm:right-4 sm:top-4 sm:bottom-auto sm:w-full sm:max-w-sm"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
