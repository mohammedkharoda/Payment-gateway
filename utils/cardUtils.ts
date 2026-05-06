import type { CardType } from "@/types";

// Utility functions for credit card processing
export function detectCardType(number: string): CardType {
  const clean = number.replace(/\s/g, "");
  if (/^4/.test(clean)) return "visa";
  if (/^5[1-5]|^2[2-7]/.test(clean)) return "mastercard";
  if (/^3[47]/.test(clean)) return "amex";
  if (/^6(?:011|5)/.test(clean)) return "discover";
  return "unknown";
}

// Format card number with spaces for better readability
export function formatCardNumber(value: string): string {
  const clean = value.replace(/\D/g, "");
  const type = detectCardType(clean);
  // Amex: 4-6-5 format 
  if (type === "amex") {
    return clean
      .slice(0, 15)
      .replace(/^(\d{0,4})(\d{0,6})(\d{0,5})/, (_, a, b, c) =>
        [a, b, c].filter(Boolean).join(" ")
      );
  }
  // Default: 4-4-4-4 format
  return clean
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

// Get the expected length of the card number based on its type
export function getCardLength(type: CardType): number {
  return type === "amex" ? 15 : 16;
}

// Get the expected length of the CVV based on card type
export function getCvvLength(type: CardType): number {
  return type === "amex" ? 4 : 3;
}

// Mask the card number for display, showing only the last 4 or 5 digits based on card type
export function maskCardNumber(number: string): string {
  const clean = number.replace(/\s/g, "");
  const type = detectCardType(clean);
  if (type === "amex") {
    return `•••• •••••• ${clean.slice(-5)}`;
  }
  return `•••• •••• •••• ${clean.slice(-4)}`;
}

// Validate card number using the Luhn algorithm
/*
  Luhn algorithm steps:
  1. Remove all non-digit characters from the card number.
  2. Starting from the rightmost digit, double every second digit.
  3. If doubling results in a number greater than 9, subtract 9 from it.
  4. Sum all the digits together.
  5. If the total sum is divisible by 10, the card number is valid.
*/ 
export function luhnCheck(number: string): boolean {
  const digits = number.replace(/\D/g, "").split("").reverse().map(Number);
  const sum = digits.reduce((acc, digit, i) => {
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    return acc + digit;
  }, 0);
  return sum % 10 === 0;
}

// Validate the card number and return an error message if invalid
export function validateCardNumber(number: string): string | null {
  const clean = number.replace(/\s/g, "");
  const type = detectCardType(clean);
  if (type === "unknown") return "Unsupported card type";
  if (clean.length !== getCardLength(type)) return `Card number must be ${getCardLength(type)} digits`;
  if (!luhnCheck(clean)) return "Invalid card number";
  return null;
}