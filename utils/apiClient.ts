import type { PaymentPayload, PaymentApiResponse, PaymentProcessingStatus } from "@/types";

export interface ApiResult {
  outcome: PaymentProcessingStatus;
  data?: PaymentApiResponse;
  reason?: string;
}

export async function postPayment(
  transactionId: string,
  payload: PaymentPayload,
  signal?: AbortSignal
): Promise<ApiResult> {
  try {
    const res = await fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactionId, ...payload }),
      signal,
    });

    const json: PaymentApiResponse = await res.json();

    switch (json.outcome) {
      case "success":
        return { outcome: "Success", data: json };
      case "failed":
        return { outcome: "Failed", reason: json.reason };
      case "timeout":
        return { outcome: "Timeout" };
      case "validation_error":
        return { outcome: "Failed", reason: "Validation failed" };
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { outcome: "Failed", reason: "Request cancelled" };
    }
    return { outcome: "Failed", reason: "Network error. Try again." };
  }
}
