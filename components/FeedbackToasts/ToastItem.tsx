"use client";

import { CheckCircle2, Clock, X, XCircle } from "lucide-react";
import type { FeedbackToast } from "./types";

interface ToastItemProps {
  toast: FeedbackToast;
  onDismiss: (id: string) => void;
}

function getAccentClasses(toast: FeedbackToast) {
  if (toast.kind === "timeout") {
    return {
      border: "border-amber-200/80",
      icon: "bg-amber-100 text-amber-700",
      bar: "from-amber-400 to-orange-400",
    };
  }
  if (toast.tone === "success") {
    return {
      border: "border-emerald-200/80",
      icon: "bg-emerald-100 text-emerald-700",
      bar: "from-emerald-400 to-teal-400",
    };
  }
  return {
    border: "border-rose-200/80",
    icon: "bg-rose-100 text-rose-700",
    bar: "from-rose-400 to-orange-400",
  };
}

function getIcon(toast: FeedbackToast) {
  if (toast.kind === "timeout") return Clock;
  if (toast.tone === "success") return CheckCircle2;
  return XCircle;
}

export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const accent = getAccentClasses(toast);
  const Icon = getIcon(toast);

  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      className={[
        "toast-enter pointer-events-auto relative overflow-hidden rounded-[22px] border bg-white/96 p-4 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.55)] backdrop-blur",
        accent.border,
      ].join(" ")}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${accent.bar}`} />

      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-2xl p-2 ${accent.icon}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-950">{toast.title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{toast.description}</p>
        </div>

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Dismiss ${toast.title} notification`}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
