"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { CardType } from "@/types";

interface CardBrandMarkProps {
  type: CardType;
  tone?: "light" | "dark";
  size?: "sm" | "md";
  className?: string;
}

const BRAND_META: Record<Exclude<CardType, "unknown">, {
  src: string;
  alt: string;
  darkShell: string;
  lightShell: string;
}> = {
  visa: {
    src: "/icons/visa-card.svg",
    alt: "Visa",
    darkShell: "border-[#1565C0]/30 bg-[#1565C0]/8 shadow-[#1565C0]/20",
    lightShell: "border-[#1565C0]/25 bg-[#1565C0]/15",
  },
  mastercard: {
    src: "/icons/mastercard-svgrepo-com.svg",
    alt: "Mastercard",
    darkShell: "border-[#FF5E00]/30 bg-[#FF5E00]/8 shadow-[#FF5E00]/20",
    lightShell: "border-[#FF5E00]/25 bg-[#FF5E00]/15",
  },
  amex: {
    src: "/icons/amex-svgrepo-com.svg",
    alt: "American Express",
    darkShell: "border-[#006FCF]/30 bg-[#006FCF]/8 shadow-[#006FCF]/20",
    lightShell: "border-[#006FCF]/25 bg-[#006FCF]/15",
  },
  discover: {
    src: "/icons/discover-card.svg",
    alt: "Discover",
    darkShell: "border-[#FF6D00]/30 bg-[#FF6D00]/8 shadow-[#FF6D00]/20",
    lightShell: "border-[#FF6D00]/25 bg-[#FF6D00]/15",
  },
};

const SIZE_STYLES = {
  sm: {
    shell: "h-8 rounded-xl px-2.5",
    logoWrap: "h-5 w-[52px]",
    fallback: "text-[10px]",
  },
  md: {
    shell: "h-10 rounded-2xl px-3",
    logoWrap: "h-7 w-[68px]",
    fallback: "text-xs",
  },
} as const;

export function CardBrandMark({
  type,
  tone = "dark",
  size = "md",
  className,
}: CardBrandMarkProps) {
  const styles = SIZE_STYLES[size];

  if (type === "unknown") {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center border font-semibold uppercase tracking-[0.24em] backdrop-blur",
          styles.shell,
          tone === "light"
            ? "border-white/15 bg-white/10 text-white/80"
            : "border-slate-200 bg-white text-slate-700 shadow-sm",
          className
        )}
      >
        <span className={styles.fallback}>Card</span>
      </div>
    );
  }

  const brand = BRAND_META[type];
  const shellTone = tone === "light" ? brand.lightShell : brand.darkShell;

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center border backdrop-blur shadow-sm",
        styles.shell,
        shellTone,
        className
      )}
    >
      <span className={cn("relative block overflow-hidden", styles.logoWrap)}>
        <Image
          src={brand.src}
          alt={brand.alt}
          fill
          sizes={size === "sm" ? "52px" : "68px"}
          className="object-contain"
        />
      </span>
    </div>
  );
}
