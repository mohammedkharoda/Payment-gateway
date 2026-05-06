"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Currency } from "@/types";


interface Props {
  value: Currency;
  onChange: (value: Currency) => void;
  disabled?: boolean;
}

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "GBP", label: "British Pound", symbol: "£" },
  { value: "INR", label: "Indian Rupee", symbol: "₹" },
  { value: "JPY", label: "Japanese Yen", symbol: "¥" },
];


export function CurrencySelector({ value, onChange, disabled }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Currency)} disabled={disabled}>
      <SelectTrigger className="w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((c) => (
          <SelectItem key={c.value} value={c.value}>
            <span className="font-mono">{c.symbol}</span> {c.value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { CURRENCIES };
