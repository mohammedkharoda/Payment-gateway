"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronRight, ReceiptText, XCircle } from "lucide-react";
import { CardBrandMark } from "@/components/CardBrandMark";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CURRENCIES } from "./CurrencySelector";
import type { Transaction } from "@/types";

function formatAmount(amount: number, currency: string) {
  const symbol = CURRENCIES.find((item) => item.value === currency)?.symbol ?? "";
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

function formatDate(timestamp: Date | string) {
  const date = new Date(timestamp);
  return {
    date: date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }),
    time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}

function getTransactionSignature(tx: Transaction) {
  return [
    tx.status,
    tx.amount,
    tx.currency,
    new Date(tx.timestamp).getTime(),
  ].join(":");
}

function TransactionHistorySkeleton() {
  return (
    <div className="space-y-4 min-h-72" aria-hidden="true">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="h-4 w-24 rounded-full bg-slate-200 animate-pulse" />
          <div className="mt-2 h-3 w-44 rounded-full bg-slate-100 animate-pulse" />
        </div>
        <div className="h-8 w-20 rounded-full bg-slate-100 animate-pulse" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-3xl border border-slate-200 bg-slate-50/80 px-4 py-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="h-10 w-10 rounded-2xl bg-slate-200 animate-pulse" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-32 rounded-full bg-slate-200 animate-pulse" />
                  <div className="h-3 w-48 rounded-full bg-slate-100 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <div className="ml-auto h-4 w-20 rounded-full bg-slate-200 animate-pulse" />
                <div className="ml-auto h-5 w-16 rounded-full bg-slate-100 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DetailViewProps {
  tx: Transaction;
  onBack: () => void;
}

function DetailView({ tx, onBack }: DetailViewProps) {
  const { date, time } = formatDate(tx.timestamp);
  const isSuccess = tx.status === "success";

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
        aria-label="Back to transaction list"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to history
      </button>

      <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
        <div className="flex flex-col items-center gap-3 py-3 text-center">
          <div
            className={[
              "flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm",
              isSuccess ? "text-emerald-600" : "text-rose-600",
            ].join(" ")}
          >
            {isSuccess ? (
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            ) : (
              <XCircle className="h-8 w-8" aria-hidden="true" />
            )}
          </div>
          <p className="text-3xl font-semibold text-slate-950">
            {formatAmount(tx.amount, tx.currency)}
          </p>
          <Badge variant={isSuccess ? "default" : "destructive"} className="capitalize">
            {tx.status}
          </Badge>
        </div>

        <dl className="mt-5 space-y-3 text-sm">
          {(
            [
              ["Cardholder", tx.cardHolder],
              ["Currency", tx.currency],
              ["Date", date],
              ["Time", time],
              ["Transaction ID", tx.id],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div
              key={label}
              className="flex items-start justify-between gap-4 rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
            >
              <dt className="shrink-0 text-slate-500">{label}</dt>
              <dd className="text-right font-medium text-slate-900 break-all" title={value}>
                {label === "Transaction ID" ? (
                  <span className="font-mono text-xs">{value}</span>
                ) : (
                  value
                )}
              </dd>
            </div>
          ))}
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/70 bg-white/80 px-4 py-3">
            <dt className="shrink-0 text-slate-500">Card</dt>
            <dd className="flex items-center gap-3">
              <CardBrandMark type={tx.cardType} size="sm" />
              <span className="font-medium text-slate-900">**** {tx.cardLastFour}</span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export function TransactionHistory() {
  const { transactions, hasHydrated, clear } = useTransactionHistory();
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [animatedIds, setAnimatedIds] = useState<Record<string, "enter" | "update">>({});
  const previousTransactionsRef = useRef<Transaction[]>([]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const previousTransactions = previousTransactionsRef.current;
    const previousById = new Map(previousTransactions.map((tx) => [tx.id, tx]));
    const nextAnimations: Record<string, "enter" | "update"> = {};

    for (const tx of transactions) {
      const previous = previousById.get(tx.id);

      if (!previous) {
        nextAnimations[tx.id] = "enter";
        continue;
      }

      if (getTransactionSignature(previous) !== getTransactionSignature(tx)) {
        nextAnimations[tx.id] = "update";
      }
    }

    previousTransactionsRef.current = transactions;

    const ids = Object.keys(nextAnimations);
    if (ids.length === 0) {
      return;
    }

    setAnimatedIds((current) => ({ ...current, ...nextAnimations }));

    const timeoutId = window.setTimeout(() => {
      setAnimatedIds((current) => {
        const next = { ...current };
        for (const id of ids) {
          delete next[id];
        }
        return next;
      });
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [transactions]);

  if (!hasMounted || !hasHydrated) {
    return <TransactionHistorySkeleton />;
  }

  if (selected) {
    const live = transactions.find((item) => item.id === selected.id) ?? selected;
    return <DetailView tx={live} onBack={() => setSelected(null)} />;
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
          <ReceiptText className="h-7 w-7" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">No transactions yet</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
          Submit a payment to build your activity feed. Successful payments and failed attempts will both appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Activity feed</p>
          <p className="mt-1 text-sm text-slate-500">
            {transactions.length} stored transaction{transactions.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clear}
          className="self-start rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        >
          Clear all
        </Button>
      </div>

      <ul className="space-y-3 sm:max-h-96 sm:overflow-y-auto sm:pr-1" aria-label="Transaction history">
        {transactions.map((tx) => {
          const { date, time } = formatDate(tx.timestamp);
          const isSuccess = tx.status === "success";

          return (
            <li key={tx.id}>
              <button
                type="button"
                onClick={() => setSelected(tx)}
                className={[
                  "w-full rounded-3xl border border-slate-200 bg-slate-50/75 px-4 py-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  animatedIds[tx.id] === "enter" && "history-item-enter",
                  animatedIds[tx.id] === "update" && "history-item-update",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={`${tx.cardHolder}, ${formatAmount(tx.amount, tx.currency)}, ${tx.status}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div
                      className={[
                        "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm",
                        isSuccess ? "text-emerald-600" : "text-rose-600",
                      ].join(" ")}
                    >
                      {isSuccess ? (
                        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <XCircle className="h-5 w-5" aria-hidden="true" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-semibold text-slate-900">{tx.cardHolder}</span>
                        <Badge variant={isSuccess ? "default" : "destructive"} className="text-[11px] capitalize">
                          {tx.status}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <CardBrandMark type={tx.cardType} size="sm" />
                        <p className="text-sm text-slate-500">
                          ending in {tx.cardLastFour}
                        </p>
                      </div>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                        {date} at {time}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatAmount(tx.amount, tx.currency)}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                      View
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
