import type { Metadata } from "next";
import Link from "next/link";
import RefusedBanner from "@/components/RefusedBanner";
import StatusBadge from "@/components/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/pricing";
import { formatLongDate } from "@/lib/booking";

export const metadata: Metadata = { title: "My bookings | CleanPro" };

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const supabase = await createClient(); // RLS returns only this customer's jobs
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id,status,scheduled_date,scheduled_time_slot,calculated_price_ngn,address_text,services(name)")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <RefusedBanner error={error} />
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">My bookings</h1>
        <Link href="/dashboard/book" className="flex h-11 items-center rounded-lg bg-brand-700 px-4 text-sm font-semibold text-white hover:opacity-90">
          Book a clean
        </Link>
      </div>

      {!jobs || jobs.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-700">
          <p>You have no bookings yet.</p>
          <Link href="/#calculator" className="mt-3 inline-block font-semibold text-brand-700 underline">Get an instant price</Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {jobs.map((j) => {
            const service = j.services as unknown as { name: string } | null;
            return (
              <li key={j.id}>
                <Link href={`/dashboard/bookings/${j.id}`} className="block rounded-xl border border-gray-100 p-4 shadow-sm hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{service?.name ?? "Cleaning service"}</p>
                    <StatusBadge status={j.status} />
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{formatLongDate(j.scheduled_date)} · {j.scheduled_time_slot}</p>
                  <p className="mt-1 truncate text-sm text-gray-600">{j.address_text}</p>
                  <p className="mt-2 font-bold text-brand-700">{formatNaira(Number(j.calculated_price_ngn))}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
