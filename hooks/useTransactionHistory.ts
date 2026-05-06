import { usePaymentStore } from "@/store/paymentStore";
import { detectCardType } from "@/utils/cardUtils";
import type { Currency, Transaction } from "@/types";

export function useTransactionHistory() {
  const transactionHistory = usePaymentStore((s) => s.transactionHistory);
  const addToHistory = usePaymentStore((s) => s.addToHistory);

  function addTransaction(tx: {
    cardHolder: string;
    cardNumber: string;
    amount: number;
    currency: Currency;
    status: "success" | "failed";
  }) {
    const record: Transaction = {
      id: crypto.randomUUID(),
      cardHolder: tx.cardHolder,
      cardLastFour: tx.cardNumber.replace(/\s/g, "").slice(-4),
      cardType: detectCardType(tx.cardNumber),
      amount: tx.amount,
      currency: tx.currency,
      status: tx.status,
      timestamp: new Date(),
    };
    addToHistory(record);
  }

  function clear() {
    // Clear by replacing with empty — store slice handles persistence
    usePaymentStore.setState({ transactionHistory: [] });
  }

  return { transactions: transactionHistory, addTransaction, clear };
}
