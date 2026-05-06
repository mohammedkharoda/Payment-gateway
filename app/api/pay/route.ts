import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { validatePayload } from "@/utils/validators";
import { detectCardType } from "@/utils/cardUtils";
import type {
  PaymentRequest,
  PaymentApiResponse,
  PaymentSuccessResponse,
  PaymentFailedResponse,
  PaymentTimeoutResponse,
  PaymentValidationErrorResponse,
} from "@/types";

const DECLINE_REASONS = [
  "Insufficient funds",
  "Card declined by issuing bank",
  "Transaction limit exceeded",
  "Card reported lost or stolen",
  "Do not honour",
];

function roll(): "success" | "failed" | "timeout" {
  const r = Math.random();
  if (r < 0.60) return "success";
  if (r < 0.85) return "failed";   // 0.60–0.85 = 25%
  return "timeout";                 // 0.85–1.00 = 15%
}

export async function POST(req: NextRequest): Promise<NextResponse<PaymentApiResponse>> {
  let body: PaymentRequest;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { outcome: "validation_error", errors: { cardNumber: "Invalid request body" } } satisfies PaymentValidationErrorResponse,
      { status: 400 }
    );
  }

  const { transactionId, ...payload } = body;

  if (!transactionId) {
    return NextResponse.json(
      { outcome: "validation_error", errors: { cardNumber: "Missing transactionId" } } satisfies PaymentValidationErrorResponse,
      { status: 400 }
    );
  }

  const errors = validatePayload(payload);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { outcome: "validation_error", errors } satisfies PaymentValidationErrorResponse,
      { status: 422 }
    );
  }

  const outcome = roll();

  if (outcome === "timeout") {
    await new Promise((r) => setTimeout(r, 8000));
    return NextResponse.json(
      { outcome: "timeout", transactionId } satisfies PaymentTimeoutResponse,
      { status: 504 }
    );
  }

  // Normal processing delay 200–600ms
  await new Promise((r) => setTimeout(r, 200 + Math.random() * 400));

  if (outcome === "failed") {
    const reason = DECLINE_REASONS[Math.floor(Math.random() * DECLINE_REASONS.length)];
    return NextResponse.json(
      { outcome: "failed", transactionId, reason } satisfies PaymentFailedResponse,
      { status: 402 }
    );
  }

  const clean = payload.cardNumber.replace(/\s/g, "");
  return NextResponse.json(
    {
      outcome: "success",
      transactionId,
      id: randomUUID(),
      cardHolder: payload.cardHolder,
      cardLastFour: clean.slice(-4),
      cardType: detectCardType(clean),
      amount: payload.amount,
      currency: payload.currency,
      timestamp: new Date().toISOString(),
    } satisfies PaymentSuccessResponse,
    { status: 200 }
  );
}
