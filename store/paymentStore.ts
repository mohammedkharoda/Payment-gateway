import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PaymentProcessingStatus, PaymentStatus, Currency, ValidationErrors, Transaction, PaymentPayload } from "@/types";

interface CurrentTransaction {
  payload: PaymentPayload;
  startedAt: number;
}

interface PaymentFormFields {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  amount: string;
  currency: Currency;
}

interface PaymentState extends PaymentFormFields {
  // Processing state
  processingStatus: PaymentProcessingStatus;
  currentTransaction: CurrentTransaction | null;
  retryCount: number;
  errorMessage: string;
  hasHydrated: boolean;

  // Form UI state
  status: PaymentStatus;
  errors: ValidationErrors;

  // History (persisted to localStorage)
  transactionHistory: Transaction[];

  // Actions
  startPayment: (payload: PaymentPayload) => void;
  setStatus: (status: PaymentStatus) => void;
  setProcessingStatus: (s: PaymentProcessingStatus) => void;
  incrementRetry: () => void;
  resetRetry: () => void;
  addToHistory: (tx: Transaction) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setField: (field: keyof PaymentFormFields, value: string) => void;
  setErrors: (errors: ValidationErrors) => void;
  setErrorMessage: (msg: string) => void;
  reset: () => void;
}

const FORM_DEFAULTS: PaymentFormFields = {
  cardNumber: "",
  cardHolder: "",
  expiryMonth: "",
  expiryYear: "",
  cvv: "",
  amount: "",
  currency: "USD",
};

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set) => ({
      ...FORM_DEFAULTS,

      processingStatus: "Idle",
      currentTransaction: null,
      retryCount: 0,
      errorMessage: "",
      hasHydrated: false,

      status: "idle",
      errors: {},

      transactionHistory: [],

      startPayment: (payload) =>
        set({
          currentTransaction: { payload, startedAt: Date.now() },
          processingStatus: "Processing",
          status: "loading",
          errorMessage: "",
        }),

      setStatus: (status) => set({ status }),

      setProcessingStatus: (processingStatus) => set({ processingStatus }),

      incrementRetry: () => set((s) => ({ retryCount: s.retryCount + 1 })),

      resetRetry: () => set({ retryCount: 0 }),

      addToHistory: (tx) =>
        set((s) => {
          const existing = s.transactionHistory.findIndex((t) => t.id === tx.id);
          if (existing !== -1) {
            // Retry — update status/timestamp in place, keep position
            const next = [...s.transactionHistory];
            next[existing] = tx;
            return { transactionHistory: next };
          }
          return { transactionHistory: [tx, ...s.transactionHistory].slice(0, 50) };
        }),

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      setField: (field, value) =>
        set((s) => ({
          [field]: value,
          errors: { ...s.errors, [field]: undefined },
        })),

      setErrors: (errors) => set({ errors }),

      setErrorMessage: (errorMessage) => set({ errorMessage }),

      reset: () =>
        set({
          ...FORM_DEFAULTS,
          processingStatus: "Idle",
          currentTransaction: null,
          status: "idle",
          errors: {},
          errorMessage: "",
        }),
    }),
    {
      name: "payment-store",
      // Only persist history - form fields and in-flight state are transient
      partialize: (s) => ({ transactionHistory: s.transactionHistory }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
