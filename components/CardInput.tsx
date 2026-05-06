"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencySelector } from "./CurrencySelector";
import { usePayment } from "@/hooks/usePayment";
import { getCvvLength, detectCardType } from "@/utils/cardUtils";
import {
  validateCardNumber,
  validateCardHolder,
  validateExpiry,
  validateCvv,
  validateAmount,
} from "@/utils/validators";
import type { Currency } from "@/types";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 12 }, (_, i) => String(currentYear + i));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

interface FieldProps {
  id: string;
  label: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

function Field({ id, label, error, children, className }: FieldProps) {
  const errId = `${id}-err`;
  return (
    <div className={className ? `space-y-2 ${className}` : "space-y-2"}>
      <Label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
        {label}
      </Label>
      {children}
      {error && (
        <p id={errId} role="alert" className="text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

interface CardInputProps {
  onCvvFocus?: () => void;
  onCvvBlur?: () => void;
}

export function CardInput({ onCvvFocus, onCvvBlur }: CardInputProps) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const errId = (name: string) => `${id(name)}-err`;

  const {
    cardNumber, cardHolder, expiryMonth, expiryYear, cvv, amount, currency,
    errors, status,
    handleCardNumberChange,
    setField,
    setErrors,
  } = usePayment();

  const isLoading = status === "loading";
  const cardType = detectCardType(cardNumber.replace(/\s/g, ""));
  const cvvLen = getCvvLength(cardType);
  const isDetected = cardType !== "unknown";

  const BRAND_PILL: Record<string, { label: string; dot: string }> = {
    visa: { label: "Visa detected", dot: "bg-[#1565C0]" },
    mastercard: { label: "Mastercard detected", dot: "bg-[#ED0006]" },
    amex: { label: "American Express detected", dot: "bg-[#006FCF]" },
    discover: { label: "Discover detected", dot: "bg-[#FF6D00]" },
  };

  function onBlurCardNumber() {
    const err = validateCardNumber(cardNumber);
    setErrors({ ...errors, cardNumber: err });
  }

  function onBlurCardHolder() {
    const err = validateCardHolder(cardHolder);
    setErrors({ ...errors, cardHolder: err });
  }

  function onBlurExpiry() {
    const { month, year } = validateExpiry(expiryMonth, expiryYear);
    setErrors({ ...errors, expiryMonth: month, expiryYear: year });
  }

  function onBlurCvv() {
    const err = validateCvv(cvv, cardNumber);
    setErrors({ ...errors, cvv: err });
  }

  function onBlurAmount() {
    const err = validateAmount(parseFloat(amount));
    setErrors({ ...errors, amount: err });
  }

  const selectCls =
    "flex h-11 w-full rounded-2xl border border-slate-200 bg-white/90 px-3.5 py-1 text-sm shadow-sm " +
    "transition-colors focus-visible:border-slate-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 " +
    "disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="space-y-4 sm:space-y-5">
      <Field
        id={id("cardNumber")}
        label="Card Number"
        error={errors.cardNumber}
      >
        <Input
          id={id("cardNumber")}
          aria-describedby={errors.cardNumber ? errId("cardNumber") : undefined}
          aria-invalid={!!errors.cardNumber}
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChange={(e) => handleCardNumberChange(e.target.value)}
          onBlur={onBlurCardNumber}
          disabled={isLoading}
          inputMode="numeric"
          maxLength={cardType === "amex" ? 17 : 19}
          className="h-11 rounded-2xl px-3.5 font-mono text-[15px] shadow-sm focus-visible:ring-4 border-slate-200 bg-white/90 focus-visible:border-slate-950 focus-visible:ring-slate-200"
          autoComplete="cc-number"
        />
        {isDetected && BRAND_PILL[cardType] && (
          <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full border border-slate-200 bg-white text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
            <span className={`h-1.5 w-1.5 rounded-full ${BRAND_PILL[cardType].dot}`} />
            {BRAND_PILL[cardType].label}
          </span>
        )}
      </Field>

      <Field id={id("cardHolder")} label="Cardholder Name" error={errors.cardHolder}>
        <Input
          id={id("cardHolder")}
          aria-describedby={errors.cardHolder ? errId("cardHolder") : undefined}
          aria-invalid={!!errors.cardHolder}
          placeholder="John Doe"
          value={cardHolder}
          onChange={(e) => setField("cardHolder", e.target.value)}
          onBlur={onBlurCardHolder}
          disabled={isLoading}
          className="h-11 rounded-2xl border-slate-200 bg-white/90 px-3.5 shadow-sm focus-visible:border-slate-950 focus-visible:ring-4 focus-visible:ring-slate-200"
          autoComplete="cc-name"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <Field id={id("expiryMonth")} label="Month" error={errors.expiryMonth}>
          <select
            id={id("expiryMonth")}
            aria-describedby={errors.expiryMonth ? errId("expiryMonth") : undefined}
            aria-invalid={!!errors.expiryMonth}
            value={expiryMonth}
            onChange={(e) => setField("expiryMonth", e.target.value)}
            onBlur={onBlurExpiry}
            disabled={isLoading}
            className={selectCls}
            autoComplete="cc-exp-month"
          >
            <option value="">MM</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </Field>

        <Field id={id("expiryYear")} label="Year" error={errors.expiryYear}>
          <select
            id={id("expiryYear")}
            aria-describedby={errors.expiryYear ? errId("expiryYear") : undefined}
            aria-invalid={!!errors.expiryYear}
            value={expiryYear}
            onChange={(e) => setField("expiryYear", e.target.value)}
            onBlur={onBlurExpiry}
            disabled={isLoading}
            className={selectCls}
            autoComplete="cc-exp-year"
          >
            <option value="">YY</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </Field>

        <Field id={id("cvv")} label={`CVV (${cvvLen})`} error={errors.cvv} className="col-span-2 sm:col-span-1">
          <Input
            id={id("cvv")}
            aria-describedby={errors.cvv ? errId("cvv") : undefined}
            aria-invalid={!!errors.cvv}
            placeholder={"*".repeat(cvvLen)}
            value={cvv}
            onChange={(e) => setField("cvv", e.target.value.replace(/\D/g, "").slice(0, cvvLen))}
            onFocus={onCvvFocus}
            onBlur={() => { onBlurCvv(); onCvvBlur?.(); }}
            disabled={isLoading}
            inputMode="numeric"
            type="password"
            maxLength={cvvLen}
            className="h-11 rounded-2xl border-slate-200 bg-white/90 px-3.5 shadow-sm focus-visible:border-slate-950 focus-visible:ring-4 focus-visible:ring-slate-200"
            autoComplete="cc-csc"
          />
        </Field>
      </div>

      <Field id={id("amount")} label="Amount" error={errors.amount}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <CurrencySelector
            value={currency as Currency}
            onChange={(v) => setField("currency", v)}
            disabled={isLoading}
          />
          <Input
            id={id("amount")}
            aria-describedby={errors.amount ? errId("amount") : undefined}
            aria-invalid={!!errors.amount}
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*\.?\d{0,2}$/.test(val)) setField("amount", val);
            }}
            onBlur={onBlurAmount}
            disabled={isLoading}
            inputMode="decimal"
            className="h-11 flex-1 rounded-2xl border-slate-200 bg-white/90 px-3.5 shadow-sm focus-visible:border-slate-950 focus-visible:ring-4 focus-visible:ring-slate-200"
          />
        </div>
      </Field>
    </div>
  );
}
