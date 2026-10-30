// SERVER ONLY. Payment lifecycle: start checkout, confirm payment.
import { randomUUID } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { initializeTransaction, verifyTransaction } from "@/lib/paystack";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { formatLongDate } from "@/lib/booking";

/** Creates a Pending payment row, asks Paystack for a checkout page, returns its URL. */
export async function beginCheckout(
  job: { id: string; calculated_price_ngn: number | string },
  email: string
): Promise<string> {
  const svc = createServiceClient();
  const reference = `CP-${randomUUID()}`;
  const amount = Number(job.calculated_price_ngn);
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

  const { error } = await svc.from("payments").insert({
    job_id: job.id, paystack_reference: reference, amount_ngn: amount, payment_status: "Pending",
  });
  if (error) throw new Error(`Could not record payment: ${error.message}`);

  try {
    const init = await initializeTransaction({
      email, amountNgn: amount, reference, jobId: job.id,
      callbackUrl: `${base}/dashboard/bookings/${job.id}`,
    });
    return init.authorization_url;
  } catch (e) {
    await svc.from("payments").update({ payment_status: "Failed" }).eq("paystack_reference", reference);
    throw e;
  }
}

export type ConfirmResult = { ok: boolean; alreadyPaid?: boolean; reason?: string };

/**
 * Marks a payment as paid ONLY after asking Paystack directly (never trusts the browser).
 * Safe to call many times (webhook + return page): it only changes a payment once.
 */
export async function confirmPayment(reference: string, expectedJobId?: string): Promise<ConfirmResult> {
  const svc = createServiceClient();
  const { data: payment } = await svc
    .from("payments").select("id,job_id,amount_ngn,payment_status").eq("paystack_reference", reference).maybeSingle();
  if (!payment) return { ok: false, reason: "unknown_reference" };
  if (expectedJobId && payment.job_id !== expectedJobId) return { ok: false, reason: "job_mismatch" };
  if (payment.payment_status === "Success") return { ok: true, alreadyPaid: true };

  const result = await verifyTransaction(reference);
  if (!result) return { ok: false, reason: "verify_failed" };
  if (result.status === "failed") {
    await svc.from("payments").update({ payment_status: "Failed" }).eq("id", payment.id).eq("payment_status", "Pending");
    return { ok: false, reason: "payment_failed" };
  }
  if (result.status !== "success") return { ok: false, reason: `not_paid_${result.status}` };

  const expectedKobo = Math.round(Number(payment.amount_ngn) * 100);
  if (result.amount !== expectedKobo || result.currency !== "NGN") {
    console.error(`[PAYMENT] amount mismatch for ${reference}: paid ${result.amount}, expected ${expectedKobo}`);
    return { ok: false, reason: "amount_mismatch" };
  }

  const { data: changed } = await svc
    .from("payments")
    .update({ payment_status: "Success", paid_at: new Date().toISOString() })
    .eq("id", payment.id)
    .in("payment_status", ["Pending", "Failed"])
    .select("id");
  if (!changed || changed.length === 0) return { ok: true, alreadyPaid: true }; // someone else got there first

  await svc.from("jobs").update({ status: "Paid" }).eq("id", payment.job_id).eq("status", "Pending");

  // Confirmation email (Resend)
  const { data: job } = await svc
    .from("jobs")
    .select("customer_id,scheduled_date,scheduled_time_slot,address_text,calculated_price_ngn,services(name)")
    .eq("id", payment.job_id).single();
  if (job) {
    const { data: userRes } = await svc.auth.admin.getUserById(job.customer_id as string);
    const { data: profile } = await svc.from("profiles").select("full_name").eq("id", job.customer_id).maybeSingle();
    const email = userRes?.user?.email;
    if (email) {
      const service = job.services as unknown as { name: string } | null;
      await sendBookingConfirmationEmail(email, profile?.full_name || email.split("@")[0], {
        serviceName: service?.name ?? "Cleaning service",
        dateLabel: formatLongDate(job.scheduled_date as string),
        timeSlot: job.scheduled_time_slot as string,
        address: job.address_text as string,
        amount: Number(job.calculated_price_ngn),
      });
    }
  }
  return { ok: true };
}
