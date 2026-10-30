import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import { confirmPayment } from "@/lib/payments";
import { payNow } from "@/app/dashboard/actions";
import { formatNaira } from "@/lib/pricing";
import { formatLongDate } from "@/lib/booking";

export const metadata: Metadata = { title: "Booking details | CleanPro" };

type SP = { [key: string]: string | undefined };

export default async function BookingDetail({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<SP> }) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient(); // RLS: other customers' bookings are invisible -> 404

  const loadJob = () =>
    supabase.from("jobs").select("*, services(name)").eq("id", id).single();

  let { data: job } = await loadJob();
  if (!job) notFound();

  // Paystack sends the customer back with ?reference=... : verify it with Paystack, then refresh.
  const reference = sp.reference ?? sp.trxref;
  let returnedFromPaystack = false;
  if (reference && job.status === "Pending") {
    returnedFromPaystack = true;
    const result = await confirmPayment(reference, id);
    if (result.ok) ({ data: job } = await loadJob());
  }
  if (!job) notFound();

  const { data: payments } = await supabase
    .from("payments")
    .select("id,payment_status,amount_ngn,paid_at,created_at")
    .eq("job_id", id)
    .order("created_at", { ascending: false });

  const service = job.services as unknown as { name: string } | null;
  const justPaid = job.status === "Paid" && Boolean(reference);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/dashboard/bookings" className="text-sm font-medium text-brand-700 underline">&larr; All bookings</Link>

      {justPaid && (
        <div role="status" className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          <strong>Payment received.</strong> Your booking is confirmed. We will assign a cleaner soon.
        </div>
      )}
      {job.status === "Pending" && (sp.payment === "error" || returnedFromPaystack) && (
        <div role="alert" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Payment not completed.</strong> Your booking is saved. Press Pay now to try again.
        </div>
      )}

      <div className="mt-4 flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold">{service?.name ?? "Cleaning service"}</h1>
        <StatusBadge status={job.status} />
      </div>

      <dl className="mt-6 divide-y divide-gray-100 rounded-xl border border-gray-100 text-sm">
        {[
          ["Date", formatLongDate(job.scheduled_date)],
          ["Time", job.scheduled_time_slot],
          ["Property", `${job.bedrooms} bedroom(s)/office(s), ${job.bathrooms} bathroom(s)`],
          ["Address", job.address_text],
          ...(job.landmark ? [["Landmark", job.landmark]] : []),
          ...(job.notes ? [["Notes", job.notes]] : []),
          ["Total", formatNaira(Number(job.calculated_price_ngn))],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 p-3">
            <dt className="text-gray-600">{k}</dt>
            <dd className="text-right font-medium text-gray-900">{v}</dd>
          </div>
        ))}
      </dl>

      {job.status === "Pending" && (
        <form action={payNow} className="mt-6">
          <input type="hidden" name="job_id" value={job.id} />
          <button type="submit" className="h-12 w-full rounded-lg bg-brand-700 font-semibold text-white hover:opacity-90">
            Pay now ({formatNaira(Number(job.calculated_price_ngn))})
          </button>
          <p className="mt-2 text-center text-xs text-gray-600">Paystack test mode. No real money is charged.</p>
        </form>
      )}

      {job.job_done_photo_url && (
        <section className="mt-8">
          <h2 className="text-lg font-bold">Job done photo</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={job.job_done_photo_url} alt="Photo of the finished cleaning job, taken by your cleaner"
            className="mt-3 w-full rounded-xl border border-gray-100 object-cover" />
          <p className="mt-2 text-sm text-gray-600">Photo uploaded by your cleaner when the job was completed.</p>
        </section>
      )}

      {payments && payments.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold">Payments</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {payments.map((p) => (
              <li key={p.id} className="flex justify-between rounded-lg bg-gray-50 p-3">
                <span>{formatNaira(Number(p.amount_ngn))} · {p.payment_status === "Success" ? "Paid" : p.payment_status}</span>
                <span className="text-gray-600">{new Date(p.paid_at ?? p.created_at).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos" })}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
