import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Transaction, CardType, Currency } from "@/types";
import { detectCardType } from "@/utils/cardUtils";

interface TransactionHistoryState {
  transactions: Transaction[];
  addTransaction: (tx: {
    cardHolder: string;
    cardNumber: string;
    amount: number;
    currency: Currency;
    status: "success" | "failed";
  }) => void;
  clear: () => void;
}


// Zustand store for transaction history
const useTransactionStore = create<TransactionHistoryState>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (tx) =>
        set((state) => ({
          transactions: [
            {
              // Generate a unique ID for each transaction
              id: crypto.randomUUID(),
              cardHolder: tx.cardHolder,
              cardLastFour: tx.cardNumber.replace(/\s/g, "").slice(-4),
              cardType: detectCardType(tx.cardNumber) as CardType,
              amount: tx.amount,
              currency: tx.currency,
              status: tx.status,
              timestamp: new Date(),
            },
            ...state.transactions,
          ].slice(0, 50),
        })),
      clear: () => set({ transactions: [] }),
    }),
    { name: "tx-history" }
  )
);

// Custom hook to use transaction history store

export function useTransactionHistory() {
  return useTransactionStore();
}
