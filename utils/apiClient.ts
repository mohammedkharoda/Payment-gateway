import type { PaymentPayload, Transaction } from "@/types";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export async function postPayment(
  payload: PaymentPayload,
  signal?: AbortSignal
): Promise<ApiResponse<Transaction>> {
  try {
    const res = await fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });

    const json = await res.json();

    if (!res.ok) {
      return { error: json.message ?? "Payment failed" };
    }

    return { data: json };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { error: "Request cancelled" };
    }
    return { error: "Network error. Try again." };
  }
}
