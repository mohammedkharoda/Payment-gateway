"use client";

import { Wifi } from "lucide-react";
import { CardBrandMark } from "@/components/CardBrandMark";
import { detectCardType, maskCardNumber } from "@/utils/cardUtils";
import type { CardType } from "@/types";

interface Props {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  flipped?: boolean;
}

const CARD_GRADIENTS: Record<CardType, string> = {
  visa: "linear-gradient(160deg,#0f2a5e 0%,#0a1a3a 55%,#070d1c 100%)",
  mastercard: "linear-gradient(160deg,#2a0a0a 0%,#180606 40%,#0c0404 100%)",
  amex: "linear-gradient(160deg,#062240 0%,#031528 55%,#040e1c 100%)",
  discover: "linear-gradient(160deg,#2a1200 0%,#1a0d05 50%,#0f0905 100%)",
  unknown: "linear-gradient(160deg,#1a1f2e 0%,#0f1219 55%,#080a0f 100%)",
};

const CARD_ACCENT: Record<CardType, string> = {
  visa: "rgba(21,101,192,0.18)",
  mastercard: "rgba(237,0,6,0.22)",
  amex: "rgba(0,111,207,0.18)",
  discover: "rgba(255,109,0,0.20)",
  unknown: "rgba(100,116,139,0.12)",
};
function CardFront({
  cardNumber, cardHolder, expiryMonth, expiryYear,
}: Omit<Props, "flipped">) {
  const type = detectCardType(cardNumber.replace(/\s/g, ""));
  const gradient = CARD_GRADIENTS[type];

  const displayNumber =
    cardNumber.replace(/\s/g, "").length > 4
      ? maskCardNumber(cardNumber)
      : "**** **** **** ****";

  const expiry =
    expiryMonth && expiryYear
      ? `${expiryMonth.padStart(2, "0")}/${expiryYear.slice(-2)}`
      : "MM/YY";

  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[20px] p-4 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.95)] select-none sm:rounded-[28px] sm:p-6"
      style={{ background: gradient, backfaceVisibility: "hidden" }}
      aria-hidden="false"
    >
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 20% 20%, ${CARD_ACCENT[type]}, transparent 60%)` }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.07),transparent_40%)]" />
      <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/3" />
      <div className="absolute -bottom-14 -left-6 h-44 w-44 rounded-full bg-white/3" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/65 sm:text-[11px] sm:tracking-[0.34em]">
              Digital wallet
            </p>
            {type !== "unknown" && (
              <div className="mt-2 sm:mt-3">
                <CardBrandMark type={type} tone="light" />
              </div>
            )}
          </div>
          <div className="rounded-full border border-white/15 bg-white/10 p-1.5 text-white/75 backdrop-blur sm:p-2">
            <Wifi className="h-3.5 w-3.5 rotate-90 sm:h-4 sm:w-4" aria-hidden="true" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between sm:mt-8">
          <div className="flex h-9 w-12 items-center justify-center rounded-xl bg-linear-to-br from-yellow-200/95 to-amber-500/80 shadow-inner sm:h-12 sm:w-16 sm:rounded-2xl">
            <div className="grid h-5 w-7 grid-cols-2 gap-0.5 rounded border border-amber-700/30 p-0.5 sm:h-7 sm:w-10 sm:gap-1 sm:p-1">
              <span className="rounded-sm bg-amber-600/45" />
              <span className="rounded-sm bg-amber-600/45" />
              <span className="rounded-sm bg-amber-600/45" />
              <span className="rounded-sm bg-amber-600/45" />
            </div>
          </div>
          <p className="rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/75 backdrop-blur sm:px-3 sm:py-1 sm:text-[11px] sm:tracking-[0.24em]">
            Virtual card
          </p>
        </div>

        <div className="mt-auto space-y-3 sm:space-y-5">
          <p className="font-mono text-sm tracking-[0.22em] text-white/95 sm:text-xl sm:tracking-[0.32em]">
            {displayNumber}
          </p>

          <div className="flex items-end justify-between gap-2 sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/60 sm:text-[11px] sm:tracking-[0.24em]">
                Card holder
              </p>
              <p className="mt-1 truncate text-xs font-medium tracking-[0.16em] text-white/92 sm:mt-2 sm:text-sm sm:tracking-[0.22em]">
                {cardHolder.trim() || "YOUR NAME"}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/60 sm:text-[11px] sm:tracking-[0.24em]">
                Expires
              </p>
              <p className="mt-1 font-mono text-xs tracking-[0.18em] text-white/92 sm:mt-2 sm:text-base sm:tracking-[0.24em]">
                {expiry}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardBack({ cardNumber }: { cardNumber: string }) {
  const type = detectCardType(cardNumber.replace(/\s/g, ""));
  const gradient = CARD_GRADIENTS[type];

  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[20px] text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.95)] select-none sm:rounded-[28px]"
      style={{ background: gradient, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 80% 80%, ${CARD_ACCENT[type]}, transparent 55%)` }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_40%)]" />

      <div className="relative flex h-full flex-col px-0 py-4 sm:py-6">
        <div className="flex items-start justify-between px-4 sm:px-6">
          <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-white/65 sm:text-[11px] sm:tracking-[0.34em]">
            Security side
          </p>
          <CardBrandMark type={type} tone="light" size="sm" />
        </div>
        <div className="mt-4 h-9 w-full bg-slate-950/75 sm:mt-6 sm:h-12" />

        <div className="mt-4 px-4 sm:mt-6 sm:px-6">
          <div className="rounded-xl bg-white/90 px-3 py-2 text-right shadow-inner sm:rounded-2xl sm:px-4 sm:py-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-[11px] sm:tracking-[0.24em]">
              CVV
            </p>
            <p className="mt-1 font-mono text-sm tracking-[0.35em] text-slate-900 sm:mt-2 sm:text-lg sm:tracking-[0.45em]">***</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CardPreview({ cardNumber, cardHolder, expiryMonth, expiryYear, flipped = false }: Props) {
  return (
    <div
      className="relative w-full max-w-88 sm:max-w-md"
      style={{ perspective: "1200px", aspectRatio: "1.586 / 1" }}
      role="img"
      aria-label="Card preview"
    >
      <div
        className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg) rotateZ(1deg)" : "rotateY(0deg) rotateZ(0deg)",
        }}
      >
        <CardFront
          cardNumber={cardNumber}
          cardHolder={cardHolder}
          expiryMonth={expiryMonth}
          expiryYear={expiryYear}
        />
        <CardBack cardNumber={cardNumber} />
      </div>
    </div>
  );
}
