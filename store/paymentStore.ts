import { create } from "zustand";
import type { PaymentStatus, Currency, ValidationErrors } from "@/types";

interface PaymentFormState {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  amount: string;
  currency: Currency;
  status: PaymentStatus;
  errors: ValidationErrors;
  errorMessage: string;

  setField: (field: keyof Omit<PaymentFormState, "status" | "errors" | "errorMessage" | "setField" | "setStatus" | "setErrors" | "setErrorMessage" | "reset">, value: string) => void;
  setStatus: (status: PaymentStatus) => void;
  setErrors: (errors: ValidationErrors) => void;
  setErrorMessage: (msg: string) => void;
  reset: () => void;
}

const initialState = {
  cardNumber: "",
  cardHolder: "",
  expiryMonth: "",
  expiryYear: "",
  cvv: "",
  amount: "",
  currency: "USD" as Currency,
  status: "idle" as PaymentStatus,
  errors: {} as ValidationErrors,
  errorMessage: "",
};

export const usePaymentStore = create<PaymentFormState>((set) => ({
  ...initialState,

  setField: (field, value) =>
    set((state) => ({
      ...state,
      [field]: value,
      errors: { ...state.errors, [field]: undefined },
    })),

  setStatus: (status) => set({ status }),

  setErrors: (errors) => set({ errors }),

  setErrorMessage: (errorMessage) => set({ errorMessage }),

  reset: () => set({ ...initialState }),
}));
