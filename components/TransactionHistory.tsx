"use client";

import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CURRENCIES } from "./CurrencySelector";
import type { CardType, Currency } from "@/types";

const CARD_TYPE_LABELS: Record<CardType, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  discover: "Discover",
  unknown: "Card",
};

export function TransactionHistory() {
  const { transactions, clear } = useTransactionHistory();

  if (transactions.length === 0) {
    return (
      <div className="text-center text-sm text-gray-400 py-8">
        No transactions yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-700">Recent Transactions</h3>
        <Button variant="ghost" size="sm" onClick={clear} className="text-xs text-gray-400">
          Clear all
        </Button>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {transactions.map((tx) => {
          const symbol = CURRENCIES.find((c) => c.value === tx.currency)?.symbol ?? "";
          const date = new Date(tx.timestamp);
          return (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-gray-800">{tx.cardHolder}</span>
                <span className="text-xs text-gray-400">
                  {CARD_TYPE_LABELS[tx.cardType]} ••{tx.cardLastFour} &middot;{" "}
                  {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-semibold text-gray-800">
                  {symbol}
                  {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <Badge
                  variant={tx.status === "success" ? "default" : "destructive"}
                  className="text-xs"
                >
                  {tx.status}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
