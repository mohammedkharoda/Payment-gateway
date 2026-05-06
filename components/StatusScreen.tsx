"use client";

import { useEffect, useRef } from "react";
import { CheckCircle, Clock, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaymentProcessingStatus } from "@/types";

const MAX_RETRIES = 3;

interface Props {
  processingStatus: PaymentProcessingStatus;
  errorMessage?: string;
  amount?: string;
  currency?: string;
  retryCount: number;
  onReset: () => void;
  onRetry: () => void;
}

export function StatusScreen({
  processingStatus,
  errorMessage,
  amount,
  currency,
  retryCount,
  onReset,
  onRetry,
}: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const retryBtnRef = useRef<HTMLButtonElement>(null);
  const newPaymentBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (processingStatus === "Success") {
      newPaymentBtnRef.current?.focus();
    } else if (processingStatus === "Failed" || processingStatus === "Timeout") {
      if (retryCount >= MAX_RETRIES) {
        headingRef.current?.focus();
      } else {
        retryBtnRef.current?.focus();
      }
    }
  }, [processingStatus, retryCount]);

  if (processingStatus === "Idle") return null;

  if (processingStatus === "Processing") {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Processing payment"
        className="rounded-[28px] border border-sky-100 bg-sky-50/70 px-6 py-10 text-center shadow-inner"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-sky-600 shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
        </div>
        <h3 className="mt-5 text-2xl font-semibold text-slate-950">Processing payment...</h3>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">
          Your request is on its way. Keep this window open while we finish the simulated authorization.
        </p>
      </div>
    );
  }

  if (processingStatus === "Success") {
    const formatted =
      amount && currency
        ? `${currency} ${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        : null;

    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-[28px] border border-emerald-100 bg-emerald-50/75 px-6 py-10 text-center shadow-inner"
      >
        <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
          <CheckCircle className="h-10 w-10" aria-hidden="true" />
        </div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-5 text-3xl font-semibold text-slate-950 outline-none"
        >
          Payment Successful
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">
          {formatted ? `${formatted} has been charged successfully.` : "The payment completed successfully."}
        </p>
        <div className="mt-6 flex justify-center">
          <Button
            ref={newPaymentBtnRef}
            type="button"
            onClick={onReset}
            className="h-11 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            New Payment
          </Button>
        </div>
      </div>
    );
  }

  const isTimeout = processingStatus === "Timeout";
  const exhausted = retryCount >= MAX_RETRIES;
  const attemptLabel = `Attempt ${retryCount} of ${MAX_RETRIES}`;
  const heading = isTimeout ? "Request Timed Out" : "Payment Failed";
  const body = isTimeout
    ? "The payment request took too long. Check your connection and try again."
    : (errorMessage || "Something went wrong.");

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={[
        "rounded-[28px] px-6 py-10 text-center shadow-inner",
        isTimeout
          ? "border border-amber-100 bg-amber-50/75"
          : "border border-rose-100 bg-rose-50/80",
      ].join(" ")}
    >
      <div
        className={[
          "mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white shadow-sm",
          isTimeout ? "text-amber-600" : "text-rose-600",
        ].join(" ")}
      >
        {isTimeout ? (
          <Clock className="h-10 w-10" aria-hidden="true" />
        ) : (
          <XCircle className="h-10 w-10" aria-hidden="true" />
        )}
      </div>

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mt-5 text-3xl font-semibold text-slate-950 outline-none"
      >
        {heading}
      </h2>

      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">{body}</p>

      {retryCount > 0 && (
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500" aria-live="polite">
          {exhausted ? `Maximum retries reached (${MAX_RETRIES})` : attemptLabel}
        </p>
      )}

      {exhausted ? (
        <div className="mt-6 space-y-4">
          <p className="mx-auto max-w-sm text-sm font-medium leading-6 text-rose-700">
            Payment could not be completed after {MAX_RETRIES} attempts. Please start over or try a different card.
          </p>
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              className="h-11 rounded-2xl border-slate-200 bg-white/90 px-5 text-sm font-semibold text-slate-700 hover:bg-white"
            >
              Start Over
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="h-11 rounded-2xl border-slate-200 bg-white/90 px-5 text-sm font-semibold text-slate-700 hover:bg-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            ref={retryBtnRef}
            onClick={onRetry}
            className="h-11 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {isTimeout ? "Try Again" : `Retry${retryCount > 0 ? ` (${MAX_RETRIES - retryCount} left)` : ""}`}
          </Button>
        </div>
      )}
    </div>
  );
}
