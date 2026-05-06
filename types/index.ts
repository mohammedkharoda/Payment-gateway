export type CardType = "visa" | "mastercard" | "amex" | "discover" | "unknown";

export type PaymentStatus = "idle" | "loading" | "success" | "error";

export type PaymentProcessingStatus = "Idle" | "Processing" | "Success" | "Failed" | "Timeout";

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

export interface PaymentRequest extends PaymentPayload {
  transactionId: string;
}

export interface PaymentSuccessResponse {
  outcome: "success";
  transactionId: string;
  id: string;
  cardHolder: string;
  cardLastFour: string;
  cardType: CardType;
  amount: number;
  currency: Currency;
  timestamp: string;
}

export interface PaymentFailedResponse {
  outcome: "failed";
  transactionId: string;
  reason: string;
}

export interface PaymentTimeoutResponse {
  outcome: "timeout";
  transactionId: string;
}

export interface PaymentValidationErrorResponse {
  outcome: "validation_error";
  errors: ValidationErrors;
}

export type PaymentApiResponse =
  | PaymentSuccessResponse
  | PaymentFailedResponse
  | PaymentTimeoutResponse
  | PaymentValidationErrorResponse;

export interface ValidationErrors {
  cardNumber?: string;
  cardHolder?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  amount?: string;
}
