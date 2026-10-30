import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { confirmPayment } from "@/lib/payments";

export const dynamic = "force-dynamic";

/** Paystack calls this after every payment. We check the signature, then re-verify with Paystack. */
export async function POST(req: Request) {
  const raw = await req.text();
  const secret = process.env.PAYSTACK_SECRET_KEY ?? "";
  const expected = createHmac("sha512", secret).update(raw).digest("hex");
  const given = req.headers.get("x-paystack-signature") ?? "";

  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  if (!secret || a.length !== b.length || !timingSafeEqual(a, b)) {
    console.warn("[WEBHOOK] refused: bad or missing signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    const result = await confirmPayment(event.data.reference);
    console.log(`[WEBHOOK] charge.success ${event.data.reference} ->`, result);
  }
  return NextResponse.json({ received: true });
}
