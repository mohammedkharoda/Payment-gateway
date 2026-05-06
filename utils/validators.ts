import type { PaymentPayload, ValidationErrors } from "@/types";
import { luhnCheck, detectCardType, getCvvLength, getCardLength } from "./cardUtils";

// Validation functions for payment form fields
export function validateCardNumber(value: string): string | undefined {
  const clean = value.replace(/\s/g, "");
  if (!clean) return "Card number required";
  if (!/^\d+$/.test(clean)) return "Digits only";
  const type = detectCardType(clean);
  if (clean.length !== getCardLength(type)) return `Must be ${getCardLength(type)} digits`;
  if (!luhnCheck(clean)) return "Invalid card number";
}

// Simple regex-based validation for cardholder name
export function validateCardHolder(value: string): string | undefined {
  if (!value.trim()) return "Cardholder name required";
  if (value.trim().length < 2) return "Name too short";
  if (!/^[a-zA-Z\s'-]+$/.test(value)) return "Letters only";
}

// Validate expiry date and check if card is expired
export function validateExpiry(month: string, year: string): { month?: string; year?: string } {
  const errors: { month?: string; year?: string } = {};
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (!month) {
    errors.month = "Month required";
  } else if (m < 1 || m > 12) {
    errors.month = "Invalid month";
  }

  if (!year) {
    errors.year = "Year required";
  } else if (y < currentYear) {
    errors.year = "Card expired";
  } else if (y === currentYear && m < currentMonth) {
    errors.month = "Card expired";
  }

  return errors;
}

// CVV length depends on card type (e.g. Amex has 4 digits, others have 3)

export function validateCvv(value: string, cardNumber: string): string | undefined {
  const type = detectCardType(cardNumber.replace(/\s/g, ""));
  const len = getCvvLength(type);
  if (!value) return "CVV required";
  if (!/^\d+$/.test(value)) return "Digits only";
  if (value.length !== len) return `Must be ${len} digits`;
}

// Validate amount is a positive number and within limits
export function validateAmount(value: number): string | undefined {
  if (!value || isNaN(value)) return "Amount required";
  if (value <= 0) return "Must be greater than 0";
  if (value > 1_000_000) return "Exceeds limit";
}

// Main function to validate entire payload and return errors for each field
export function validatePayload(payload: PaymentPayload): ValidationErrors {
  const errors: ValidationErrors = {};

  const cardNumberErr = validateCardNumber(payload.cardNumber);
  if (cardNumberErr) errors.cardNumber = cardNumberErr;

  const cardHolderErr = validateCardHolder(payload.cardHolder);
  if (cardHolderErr) errors.cardHolder = cardHolderErr;

  const expiryErrors = validateExpiry(payload.expiryMonth, payload.expiryYear);
  if (expiryErrors.month) errors.expiryMonth = expiryErrors.month;
  if (expiryErrors.year) errors.expiryYear = expiryErrors.year;

  const cvvErr = validateCvv(payload.cvv, payload.cardNumber);
  if (cvvErr) errors.cvv = cvvErr;

  const amountErr = validateAmount(payload.amount);
  if (amountErr) errors.amount = amountErr;

  return errors;
}
