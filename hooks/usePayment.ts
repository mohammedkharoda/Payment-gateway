import { useRef, useCallback } from "react";
import { usePaymentStore } from "@/store/paymentStore";
import { useTransactionHistory } from "./useTransactionHistory";
import { validatePayload } from "@/utils/validators";
import { postPayment } from "@/utils/apiClient";
import { formatCardNumber } from "@/utils/cardUtils";
import type { Currency } from "@/types";

export function usePayment() {
  const store = usePaymentStore();
  const { addTransaction } = useTransactionHistory();
  const abortRef = useRef<AbortController | null>(null);
  const txIdRef = useRef<string>(crypto.randomUUID());

  const handleCardNumberChange = useCallback(
    (value: string) => {
      store.setField("cardNumber", formatCardNumber(value));
    },
    [store]
  );

  const submit = useCallback(async () => {
    const payload = {
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

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    txIdRef.current = crypto.randomUUID();

    store.startPayment(payload);

    const result = await postPayment(txIdRef.current, payload, abortRef.current.signal);

    store.setProcessingStatus(result.outcome);

    if (result.outcome === "Success") {
      store.setStatus("success");
      store.resetRetry();
      addTransaction({
        cardHolder: payload.cardHolder,
        cardNumber: payload.cardNumber,
        amount: payload.amount,
        currency: payload.currency,
        status: "success",
      });
      return;
    }

    if (result.outcome === "Timeout") {
      store.setStatus("error");
      store.setErrorMessage("Payment timed out. Please try again.");
      addTransaction({
        cardHolder: payload.cardHolder,
        cardNumber: payload.cardNumber,
        amount: payload.amount,
        currency: payload.currency,
        status: "failed",
      });
      return;
    }

    // Failed
    store.setStatus("error");
    store.setErrorMessage(result.reason ?? "Payment failed.");
    addTransaction({
      cardHolder: payload.cardHolder,
      cardNumber: payload.cardNumber,
      amount: payload.amount,
      currency: payload.currency,
      status: "failed",
    });
  }, [store, addTransaction]);

  const retry = useCallback(async () => {
    store.incrementRetry();
    await submit();
  }, [store, submit]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
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
