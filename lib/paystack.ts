// SERVER ONLY. Paystack TEST mode helpers.
const BASE = "https://api.paystack.co";

function secret(): string {
  const key = process.env.PAYSTACK_SECRET_KEY ?? "";
  if (!key.startsWith("sk_test_")) {
    throw new Error("PAYSTACK_SECRET_KEY must be a TEST key (sk_test_...). Live keys are not allowed in this project.");
  }
  return key;
}

export async function initializeTransaction(p: {
  email: string; amountNgn: number; reference: string; callbackUrl: string; jobId: string;
}): Promise<{ authorization_url: string; reference: string }> {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: p.email,
      amount: Math.round(p.amountNgn * 100), // Paystack uses kobo
      currency: "NGN",
      reference: p.reference,
      callback_url: p.callbackUrl,
      metadata: { job_id: p.jobId },
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.status) throw new Error(json.message ?? "Paystack could not start the payment");
  return json.data;
}

export async function verifyTransaction(reference: string): Promise<
  { status: string; amount: number; currency: string; reference: string } | null
> {
  const res = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret()}` },
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok || !json.status) return null;
  return json.data;
}
