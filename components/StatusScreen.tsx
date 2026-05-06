"use client";

import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaymentStatus } from "@/types";

interface Props {
  status: PaymentStatus;
  errorMessage?: string;
  amount?: string;
  currency?: string;
  onReset: () => void;
  onRetry: () => void;
}

export function StatusScreen({ status, errorMessage, amount, currency, onReset, onRetry }: Props) {
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        <p className="text-lg font-medium text-gray-700">Processing payment…</p>
        <p className="text-sm text-gray-400">Do not close this window</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h2 className="text-2xl font-bold text-gray-800">Payment Successful</h2>
        {amount && currency && (
          <p className="text-gray-500">
            {currency} {parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} charged
          </p>
        )}
        <Button onClick={onReset} className="mt-2">
          New Payment
        </Button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <XCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-800">Payment Failed</h2>
        <p className="text-sm text-gray-500 text-center max-w-xs">{errorMessage || "Something went wrong."}</p>
        <div className="flex gap-3 mt-2">
          <Button variant="outline" onClick={onReset}>
            Cancel
          </Button>
          <Button onClick={onRetry}>Try Again</Button>
        </div>
      </div>
    );
  }

  return null;
}
