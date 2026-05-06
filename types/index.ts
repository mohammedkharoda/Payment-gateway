export type CardType = "visa" | "mastercard" | "amex" | "discover" | "unknown";

export type PaymentStatus = "idle" | "loading" | "success" | "error";

export type Currency = "USD" | "EUR" | "GBP" | "INR" | "JPY";

export interface PaymentPayload {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  amount: number;
  currency: Currency;
}

export interface Transaction {
  id: string;
  cardHolder: string;
  cardLastFour: string;
  cardType: CardType;
  amount: number;
  currency: Currency;
  status: "success" | "failed";
  timestamp: Date;
}

export interface ValidationErrors {
  cardNumber?: string;
  cardHolder?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  amount?: string;
}
