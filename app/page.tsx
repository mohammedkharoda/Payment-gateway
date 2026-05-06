"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ShieldCheck, TimerReset } from "lucide-react";
import { CardInput } from "@/components/CardInput";
import { CardPreview } from "@/components/CardPreview";
import { FeedbackToasts, type FeedbackToast } from "@/components/FeedbackToasts";
import { StatusScreen } from "@/components/StatusScreen";
import { TransactionHistory } from "@/components/TransactionHistory";
import { Button } from "@/components/ui/button";
import { usePayment } from "@/hooks/usePayment";

const TOAST_DURATION_MS = 4500;
const TRUST_ITEMS = [
  {
    title: "Encrypted flow",
    description: "Card details stay in a guided client-side checkout.",
    icon: ShieldCheck,
  },
  {
    title: "Fast retries",
    description: "Timeouts and failures can be retried without re-entering data.",
    icon: TimerReset,
  },
];

function formatAmountLabel(amount: string, currency: string) {
  const value = Number.parseFloat(amount);
  if (Number.isNaN(value)) {
    return currency;
  }

  return `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

export default function Home() {
  const [cvvFocused, setCvvFocused] = useState(false);
  const [toasts, setToasts] = useState<FeedbackToast[]>([]);
  const {
    cardNumber, cardHolder, expiryMonth, expiryYear,
    amount, currency, status, processingStatus,
    errorMessage, retryCount,
    submit, retry, cancel,
  } = usePayment();
  const previousStatusRef = useRef(processingStatus);
  const toastTimersRef = useRef<Map<string, number>>(new Map());
  const isTerminal = processingStatus !== "Idle";

  const dismissToast = useCallback((id: string) => {
    const timerId = toastTimersRef.current.get(id);
    if (timerId) {
      window.clearTimeout(timerId);
      toastTimersRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const enqueueToast = useCallback(
    (toast: Omit<FeedbackToast, "id">) => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, ...toast }].slice(-3));

      const timerId = window.setTimeout(() => {
        dismissToast(id);
      }, TOAST_DURATION_MS);

      toastTimersRef.current.set(id, timerId);
    },
    [dismissToast]
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void submit();
    },
    [submit]
  );

  useEffect(() => {
    return () => {
      for (const timerId of toastTimersRef.current.values()) {
        window.clearTimeout(timerId);
      }
      toastTimersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const previousStatus = previousStatusRef.current;

    if (previousStatus === "Processing") {
      if (processingStatus === "Success") {
        enqueueToast({
          title: "Payment successful",
          description: `${formatAmountLabel(amount, currency)} charged successfully.`,
          tone: "success",
          kind: "success",
        });
      } else if (processingStatus === "Timeout") {
        enqueueToast({
          title: "Payment timed out",
          description: "The request took too long. Check your connection and try again.",
          tone: "error",
          kind: "timeout",
        });
      } else if (processingStatus === "Failed") {
        enqueueToast({
          title: "Payment failed",
          description: errorMessage || "Something went wrong while processing the payment.",
          tone: "error",
          kind: "failure",
        });
      }
    }

    previousStatusRef.current = processingStatus;
  }, [amount, currency, enqueueToast, errorMessage, processingStatus]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_28%),radial-gradient(circle_at_80%_15%,rgba(125,211,252,0.22),transparent_24%),linear-gradient(135deg,#f8fafc_0%,#eef2ff_46%,#ecfeff_100%)] py-6 pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] sm:px-6 sm:py-8 lg:px-8">
      <FeedbackToasts toasts={toasts} onDismiss={dismissToast} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-size-[36px_36px] mask-[linear-gradient(to_bottom,white,transparent)]" />
      <div className="pointer-events-none absolute -left-32 top-16 h-64 w-64 rounded-full bg-cyan-200/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5 sm:gap-8">
        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600 shadow-sm backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
              Secure checkout
            </div>
            <div className="max-w-3xl space-y-2 sm:space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Payment flow that stays clear, fast, and reassuring on every screen.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7 lg:text-lg">
                Review the card preview and keep visible feedback nearby with resilient status states and transaction history.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 xl:grid-cols-2">
            {TRUST_ITEMS.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/70 bg-white/70 p-3 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.4)] backdrop-blur sm:p-4"
              >
                <div className="mb-2 inline-flex rounded-xl bg-slate-900 p-2 text-white shadow-sm sm:mb-3">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
        {/* Left: form */}
        <form
          className="relative overflow-hidden rounded-[22px] border border-white/80 bg-white/88 p-4 shadow-[0_28px_90px_-40px_rgba(15,23,42,0.45)] backdrop-blur sm:rounded-[28px] sm:p-6 xl:p-7"
          onSubmit={handleSubmit}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.16),transparent_68%)]" />
          <div className="relative space-y-3 sm:space-y-5">
            <div className="border-b border-slate-200/80 pb-3 sm:pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Payment details
                </p>
                <h2 className="mt-2 text-[1.75rem] font-semibold text-slate-950 sm:text-3xl">Secure Payment</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Complete the form below to simulate a card payment with clear status feedback and a persistent history.
                </p>
              </div>
            </div>
          </div>

          {isTerminal ? (
            <StatusScreen
              processingStatus={processingStatus}
              errorMessage={errorMessage}
              amount={amount}
              currency={currency}
              retryCount={retryCount}
              onReset={cancel}
              onRetry={retry}
            />
          ) : (
            <>
              <CardInput onCvvFocus={() => setCvvFocused(true)} onCvvBlur={() => setCvvFocused(false)} />
              <div className="flex flex-col gap-3 border-t border-slate-200/80 pt-4 sm:flex-row sm:pt-5">
                <Button
                  type="submit"
                  className="h-12 flex-1 rounded-2xl p-4 text-sm font-semibold text-white shadow-[0_20px_35px_-20px_rgba(15,23,42,0.9)] bg-slate-950 hover:bg-slate-800"
                  disabled={status === "loading"}
                >
                  Pay Now
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancel}
                  className="h-12 rounded-2xl border-slate-200 bg-white/80 px-6 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear
                </Button>
              </div>
            </>
          )}
        </form>

        {/* Right: preview + history */}
        <div className="space-y-5 sm:space-y-6">
          <div className="flex justify-center px-1 py-1">
            <CardPreview
              cardNumber={cardNumber}
              cardHolder={cardHolder}
              expiryMonth={expiryMonth}
              expiryYear={expiryYear}
              flipped={cvvFocused}
            />
          </div>

          <div className="rounded-[22px] border border-white/80 bg-white/88 p-4 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.4)] backdrop-blur sm:rounded-[28px] sm:p-6 xl:p-7">
            <div className="mb-4 sm:mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Activity
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">Recent transaction history</h2>
              </div>
            </div>

            <TransactionHistory />
          </div>
        </div>
      </div>
      </div>
    </main>
  );
}
