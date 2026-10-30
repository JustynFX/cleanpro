import type { Metadata } from "next";
import AdminNav from "@/components/AdminNav";
import { createClient } from "@/lib/supabase/server";
import { updateService } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Pricing | CleanPro" };

const input = "h-12 w-full rounded-lg border border-gray-300 px-3 text-base";

export default async function ServicesAdmin({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const { result } = await searchParams;
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services").select("id,name,description,base_price_ngn,bedroom_rate_ngn,bathroom_rate_ngn").order("base_price_ngn");

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Service pricing</h1>
      <p className="mb-6 mt-1 text-sm text-gray-600">
        Changes apply to new bookings and the public price calculator straight away. Existing bookings keep the price they were booked at.
      </p>
      <AdminNav current="/admin/services" />

      {result === "saved" && (
        <div role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          <strong>Prices saved.</strong>
        </div>
      )}
      {result === "invalid" && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <strong>Not saved.</strong> Base price must be ₦1,000 to ₦1,000,000, and each room rate ₦0 to ₦100,000.
        </div>
      )}

      <ul className="space-y-5">
        {(services ?? []).map((s) => (
          <li key={s.id} className="rounded-xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-lg font-bold">{s.name}</h2>
            <p className="mt-1 text-sm text-gray-600">{s.description}</p>
            <form action={updateService} className="mt-4 grid gap-4 sm:grid-cols-3">
              <input type="hidden" name="service_id" value={s.id} />
              <div>
                <label htmlFor={`b-${s.id}`} className="mb-1 block text-sm font-medium">Base price (₦)</label>
                <input id={`b-${s.id}`} name="base_price" type="number" inputMode="numeric" min={1000} max={1000000} required
                  defaultValue={Math.round(Number(s.base_price_ngn))} className={input} />
              </div>
              <div>
                <label htmlFor={`r-${s.id}`} className="mb-1 block text-sm font-medium">Per bedroom / office (₦)</label>
                <input id={`r-${s.id}`} name="bedroom_rate" type="number" inputMode="numeric" min={0} max={100000} required
                  defaultValue={Math.round(Number(s.bedroom_rate_ngn))} className={input} />
              </div>
              <div>
                <label htmlFor={`t-${s.id}`} className="mb-1 block text-sm font-medium">Per bathroom (₦)</label>
                <input id={`t-${s.id}`} name="bathroom_rate" type="number" inputMode="numeric" min={0} max={100000} required
                  defaultValue={Math.round(Number(s.bathroom_rate_ngn))} className={input} />
              </div>
              <button type="submit" className="h-12 rounded-lg bg-brand-700 font-semibold text-white hover:opacity-90 sm:col-span-3">
                Save prices
              </button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
