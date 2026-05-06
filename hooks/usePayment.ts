import { useRef, useCallback } from "react";
import { usePaymentStore } from "@/store/paymentStore";
import { useTransactionHistory } from "./useTransactionHistory";
import { validatePayload } from "@/utils/validators";
import { postPayment } from "@/utils/apiClient";
import { formatCardNumber } from "@/utils/cardUtils";
import type { Currency } from "@/types";

//  This hook manages the state and logic for the payment form, including input handling, validation, API interaction, and transaction history updates.

export function usePayment() {
  const store = usePaymentStore();
  const { addTransaction } = useTransactionHistory();
  const abortRef = useRef<AbortController | null>(null);

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

    store.setStatus("loading");
    store.setErrorMessage("");

    const result = await postPayment(payload, abortRef.current.signal);

    if (result.error) {
      store.setStatus("error");
      store.setErrorMessage(result.error);
      addTransaction({
        cardHolder: payload.cardHolder,
        cardNumber: payload.cardNumber,
        amount: payload.amount,
        currency: payload.currency,
        status: "failed",
      });
      return;
    }

    store.setStatus("success");
    if (result.data) {
      addTransaction({
        cardHolder: payload.cardHolder,
        cardNumber: payload.cardNumber,
        amount: payload.amount,
        currency: payload.currency,
        status: "success",
      });
    }
  }, [store, addTransaction]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    store.reset();
  }, [store]);

  return {
    ...store,
    handleCardNumberChange,
    submit,
    cancel,
  };
}
