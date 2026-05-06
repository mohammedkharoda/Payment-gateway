"use client";

import { CardInput } from "@/components/CardInput";
import { CardPreview } from "@/components/CardPreview";
import { StatusScreen } from "@/components/StatusScreen";
import { TransactionHistory } from "@/components/TransactionHistory";
import { Button } from "@/components/ui/button";
import { usePayment } from "@/hooks/usePayment";

export default function Home() {
  const { cardNumber, cardHolder, expiryMonth, expiryYear, amount, currency, status, errorMessage, submit, cancel } =
    usePayment();

  const isTerminal = status === "success" || status === "error" || status === "loading";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Secure Payment</h1>
            <p className="text-sm text-gray-500 mt-1">Enter your card details to complete the transaction</p>
          </div>

          {isTerminal ? (
            <StatusScreen
              status={status}
              errorMessage={errorMessage}
              amount={amount}
              currency={currency}
              onReset={cancel}
              onRetry={submit}
            />
          ) : (
            <>
              <CardInput />
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={submit}
                  className="flex-1"
                  disabled={false}
                >
                  Pay Now
                </Button>
                <Button variant="outline" onClick={cancel}>
                  Clear
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Right: preview + history */}
        <div className="space-y-6">
          <div className="flex justify-center">
            <CardPreview
              cardNumber={cardNumber}
              cardHolder={cardHolder}
              expiryMonth={expiryMonth}
              expiryYear={expiryYear}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <TransactionHistory />
          </div>
        </div>
      </div>
    </main>
  );
}
