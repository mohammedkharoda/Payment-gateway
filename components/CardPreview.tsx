"use client";

import { detectCardType, maskCardNumber } from "@/utils/cardUtils";
import type { CardType } from "@/types";

interface Props {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
}

const CARD_GRADIENTS: Record<CardType, string> = {
  visa: "from-blue-600 to-blue-900",
  mastercard: "from-red-500 to-orange-600",
  amex: "from-green-600 to-teal-800",
  discover: "from-orange-400 to-yellow-600",
  unknown: "from-gray-600 to-gray-900",
};

const CARD_LABELS: Record<CardType, string> = {
  visa: "VISA",
  mastercard: "MASTERCARD",
  amex: "AMERICAN EXPRESS",
  discover: "DISCOVER",
  unknown: "",
};

export function CardPreview({ cardNumber, cardHolder, expiryMonth, expiryYear }: Props) {
  const type = detectCardType(cardNumber.replace(/\s/g, ""));
  const gradient = CARD_GRADIENTS[type];
  const label = CARD_LABELS[type];

  const displayNumber =
    cardNumber.replace(/\s/g, "").length > 4
      ? maskCardNumber(cardNumber)
      : "•••• •••• •••• ••••";

  const expiry =
    expiryMonth && expiryYear
      ? `${expiryMonth.padStart(2, "0")}/${expiryYear.slice(-2)}`
      : "MM/YY";

  return (
    <div
      className={`relative w-full max-w-sm aspect-[1.586/1] rounded-2xl bg-gradient-to-br ${gradient} text-white p-6 shadow-2xl select-none overflow-hidden`}
    >
      {/* chip */}
      <div className="w-10 h-7 rounded bg-yellow-300/80 mb-6 flex items-center justify-center">
        <div className="w-6 h-4 rounded-sm border border-yellow-600/50 grid grid-cols-2 gap-0.5 p-0.5">
          <div className="bg-yellow-500/60 rounded-sm" />
          <div className="bg-yellow-500/60 rounded-sm" />
          <div className="bg-yellow-500/60 rounded-sm" />
          <div className="bg-yellow-500/60 rounded-sm" />
        </div>
      </div>

      {/* number */}
      <p className="font-mono text-lg tracking-widest mb-4 truncate">{displayNumber}</p>

      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs text-white/60 uppercase tracking-wider">Card Holder</p>
          <p className="font-medium tracking-wide truncate max-w-[180px]">
            {cardHolder || "YOUR NAME"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/60 uppercase tracking-wider">Expires</p>
          <p className="font-mono">{expiry}</p>
        </div>
      </div>

      {/* network label */}
      {label && (
        <p className="absolute top-5 right-5 text-xs font-bold tracking-widest opacity-80">
          {label}
        </p>
      )}

      {/* decorative circles */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/5" />
    </div>
  );
}
