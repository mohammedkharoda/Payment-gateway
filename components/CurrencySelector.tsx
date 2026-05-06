"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Currency } from "@/types";

export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "INR", label: "Indian Rupee", symbol: "\u20B9" },
  { value: "EUR", label: "Euro", symbol: "\u20AC" },
  { value: "GBP", label: "British Pound", symbol: "\u00A3" },
  { value: "JPY", label: "Japanese Yen", symbol: "\u00A5" },
];

interface Props {
  value: Currency;
  onChange: (value: Currency) => void;
  disabled?: boolean;
}

export function CurrencySelector({ value, onChange, disabled }: Props) {
  const selected = CURRENCIES.find((currency) => currency.value === value);

  return (
    <Select value={value} onValueChange={(nextValue) => onChange(nextValue as Currency)} disabled={disabled}>
      <SelectTrigger
        className="h-11 w-full rounded-2xl border-slate-200 bg-white/90 px-3.5 shadow-sm focus-visible:border-slate-950 focus-visible:ring-4 focus-visible:ring-slate-200 sm:w-36"
        aria-label="Select currency"
      >
        <SelectValue>
          {selected && (
            <span className="flex items-center gap-2">
              <span className="font-mono text-base">{selected.symbol}</span>
              <span className="font-semibold text-slate-800">{selected.value}</span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-2xl border border-slate-200 bg-white/98 p-1.5 shadow-xl ring-0">
        {CURRENCIES.map((currency) => (
          <SelectItem
            key={currency.value}
            value={currency.value}
            className="rounded-xl px-2 py-2 focus:bg-slate-100"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 font-mono text-sm text-slate-700">
                {currency.symbol}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900">{currency.value}</span>
                <span className="text-xs text-slate-500">{currency.label}</span>
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
