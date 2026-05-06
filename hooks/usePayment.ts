import { useRef, useCallback } from "react";
import { usePaymentStore } from "@/store/paymentStore";
import { useTransactionHistory } from "./useTransactionHistory";
import { validatePayload } from "@/utils/validators";
import { postPayment } from "@/utils/apiClient";
import { formatCardNumber } from "@/utils/cardUtils";
import type { Currency, PaymentPayload } from "@/types";

const MAX_RETRIES = 3;
const TIMEOUT_MS = 6000;

export function usePayment() {
  const store = usePaymentStore();
  const { addTransaction } = useTransactionHistory();

  // Same controller across retries for the same payment attempt
  const abortRef = useRef<AbortController | null>(null);
  // UUID set on first attempt, reused on retries, reset after success/cancel
  const txIdRef = useRef<string | null>(null);

  const handleCardNumberChange = useCallback(
    (value: string) => {
      store.setField("cardNumber", formatCardNumber(value));
    },
    [store]
  );

  const dispatchResult = useCallback(
    (
      outcome: "Success" | "Failed" | "Timeout",
      payload: PaymentPayload,
      reason?: string
    ) => {
      store.setProcessingStatus(outcome);

      const txId = txIdRef.current!;

      if (outcome === "Success") {
        store.setStatus("success");
        store.resetRetry();
        txIdRef.current = null;
        addTransaction({ transactionId: txId, ...payload, status: "success" });
        return;
      }

      const message =
        outcome === "Timeout"
          ? "Payment timed out. Please try again."
          : (reason ?? "Payment failed.");

      store.setStatus("error");
      store.setErrorMessage(message);
      addTransaction({ transactionId: txId, ...payload, status: "failed" });
    },
    [store, addTransaction]
  );

  const attemptPayment = useCallback(
    async (payload: PaymentPayload) => {
      // Abort any in-flight request, create fresh controller with 6s timeout
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const timeoutId = setTimeout(() => controller.abort("timeout"), TIMEOUT_MS);

      try {
        const result = await postPayment(txIdRef.current!, payload, controller.signal);
        clearTimeout(timeoutId);
        return result;
      } catch {
        clearTimeout(timeoutId);
        // Distinguish client-side timeout from user cancel
        const isTimeout = controller.signal.reason === "timeout";
        return {
          outcome: isTimeout ? ("Timeout" as const) : ("Failed" as const),
          reason: isTimeout ? undefined : "Request cancelled",
        };
      }
    },
    []
  );

  const submit = useCallback(async () => {
    const payload: PaymentPayload = {
      cardNumber: store.cardNumber,
      cardHolder: store.cardHolder,
      expiryMonth: store.expiryMonth,
      expiryYear: store.expiryYear,
      cvv: store.cvv,
      amount: parseFloat(store.amount),
      currency: store.currency as Currency,
    };

    const errors = validatePayload(payload);
    if (Object.keys(errors).length > 0) {
      store.setErrors(errors);
      return;
    }

    // First attempt: generate UUID. Retries reuse the same ID.
    if (txIdRef.current === null) {
      txIdRef.current = crypto.randomUUID();
    }

    store.startPayment(payload);

    const result = await attemptPayment(payload);
    dispatchResult(result.outcome, payload, result.reason);
  }, [store, attemptPayment, dispatchResult]);

  const retry = useCallback(async () => {
    if (store.retryCount >= MAX_RETRIES) {
      store.setErrorMessage(`Max retries (${MAX_RETRIES}) reached.`);
      return;
    }

    store.incrementRetry();

    const payload: PaymentPayload = {
      cardNumber: store.cardNumber,
      cardHolder: store.cardHolder,
      expiryMonth: store.expiryMonth,
      expiryYear: store.expiryYear,
      cvv: store.cvv,
      amount: parseFloat(store.amount),
      currency: store.currency as Currency,
    };

    // txIdRef.current is still set from the first attempt
    store.startPayment(payload);

    const result = await attemptPayment(payload);
    dispatchResult(result.outcome, payload, result.reason);
  }, [store, attemptPayment, dispatchResult]);

  const cancel = useCallback(() => {
    abortRef.current?.abort("cancel");
    txIdRef.current = null;
    store.resetRetry();
    store.reset();
  }, [store]);

  return {
    ...store,
    handleCardNumberChange,
    submit,
    retry,
    cancel,
  };
}
