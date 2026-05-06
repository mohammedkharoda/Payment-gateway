import { NextRequest, NextResponse } from "next/server";
import { validatePayload } from "@/utils/validators";
import type { PaymentPayload } from "@/types";
import { detectCardType } from "@/utils/cardUtils";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  let body: PaymentPayload;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  const errors = validatePayload(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ message: "Validation failed", errors }, { status: 422 });
  }

  // Simulate processing delay (200–600ms)
  await new Promise((r) => setTimeout(r, 200 + Math.random() * 400));

  // Simulate 10% failure rate for demo purposes
  if (Math.random() < 0.1) {
    return NextResponse.json({ message: "Card declined by issuing bank" }, { status: 402 });
  }

  const clean = body.cardNumber.replace(/\s/g, "");
  const transaction = {
    id: randomUUID(),
    cardHolder: body.cardHolder,
    cardLastFour: clean.slice(-4),
    cardType: detectCardType(clean),
    amount: body.amount,
    currency: body.currency,
    status: "success",
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(transaction, { status: 200 });
}
