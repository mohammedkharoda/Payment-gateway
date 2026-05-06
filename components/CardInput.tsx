"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencySelector } from "./CurrencySelector";
import { usePayment } from "@/hooks/usePayment";
import { getCvvLength, detectCardType } from "@/utils/cardUtils";
import type { Currency } from "@/types";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 12 }, (_, i) => String(currentYear + i));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

// Reusable field component to display label, input and error message
function Field({ label, error, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-gray-600 uppercase tracking-wider">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Main card input form component
export function CardInput() {
  const {
    cardNumber, cardHolder, expiryMonth, expiryYear, cvv, amount, currency,
    errors, status,
    handleCardNumberChange,
    setField,
  } = usePayment();

  const isLoading = status === "loading";
  const cardType = detectCardType(cardNumber.replace(/\s/g, ""));
  const cvvLen = getCvvLength(cardType);

  return (
    <div className="space-y-4">
      <Field label="Card Number" error={errors.cardNumber}>
        <Input
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChange={(e) => handleCardNumberChange(e.target.value)}
          disabled={isLoading}
          inputMode="numeric"
          maxLength={cardType === "amex" ? 17 : 19}
          className="font-mono"
        />
      </Field>

      <Field label="Cardholder Name" error={errors.cardHolder}>
        <Input
          placeholder="John Doe"
          value={cardHolder}
          onChange={(e) => setField("cardHolder", e.target.value)}
          disabled={isLoading}
          autoComplete="cc-name"
        />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Month" error={errors.expiryMonth}>
          <select
            value={expiryMonth}
            onChange={(e) => setField("expiryMonth", e.target.value)}
            disabled={isLoading}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">MM</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </Field>

        <Field label="Year" error={errors.expiryYear}>
          <select
            value={expiryYear}
            onChange={(e) => setField("expiryYear", e.target.value)}
            disabled={isLoading}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">YY</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </Field>

        <Field label={`CVV (${cvvLen} digits)`} error={errors.cvv}>
          <Input
            placeholder={"•".repeat(cvvLen)}
            value={cvv}
            onChange={(e) => setField("cvv", e.target.value.replace(/\D/g, "").slice(0, cvvLen))}
            disabled={isLoading}
            inputMode="numeric"
            type="password"
            maxLength={cvvLen}
          />
        </Field>
      </div>

      <Field label="Amount" error={errors.amount}>
        <div className="flex gap-2">
          <CurrencySelector
            value={currency as Currency}
            onChange={(v) => setField("currency", v)}
            disabled={isLoading}
          />
          <Input
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*\.?\d{0,2}$/.test(val)) setField("amount", val);
            }}
            disabled={isLoading}
            inputMode="decimal"
            className="flex-1"
          />
        </div>
      </Field>
    </div>
  );
}
