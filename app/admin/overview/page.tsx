import type { Metadata } from "next";
import Link from "next/link";
import AdminNav from "@/components/AdminNav";
import RefusedBanner from "@/components/RefusedBanner";
import StatusBadge from "@/components/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/pricing";

export const metadata: Metadata = { title: "Admin overview | CleanPro" };

type Stats = {
  revenue_total: number | string;
  revenue_30d: number | string;
  jobs_total: number | string;
  by_status: Record<string, number>;
};

const ORDER = ["Pending", "Paid", "Assigned", "In Progress", "Completed", "Cancelled"];

function Card({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-gray-100 p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wider text-gray-600">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-brand-700">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-600">{hint}</p>}
    </div>
  );
}

export default async function AdminOverview({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data, error: rpcError } = await supabase.rpc("admin_stats");
  const stats = data as Stats | null;
  const by = stats?.by_status ?? {};

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <RefusedBanner error={error} />
      <h1 className="text-2xl font-bold">Business overview</h1>
      <p className="mb-6 mt-1 text-sm text-gray-600">Revenue counts successful test payments only.</p>
      <AdminNav current="/admin/overview" />

      {!stats ? (
        <p role="alert" className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
          The numbers could not be loaded{rpcError ? ` (${rpcError.message})` : ""}. Make sure the Phase 5 SQL file
          (0003_admin_stats.sql) was run in Supabase.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card label="Total revenue" value={formatNaira(Number(stats.revenue_total))} />
            <Card label="Last 30 days" value={formatNaira(Number(stats.revenue_30d))} />
            <Card label="Completed jobs" value={String(by["Completed"] ?? 0)} hint={`of ${Number(stats.jobs_total)} bookings`} />
            <Card label="Need a cleaner" value={String(by["Paid"] ?? 0)} hint="paid, not yet assigned" />
          </div>

          {(by["Paid"] ?? 0) > 0 && (
            <Link href="/admin/dispatch" className="mt-4 flex h-12 items-center justify-center rounded-lg bg-brand-700 font-semibold text-white hover:opacity-90">
              Assign {by["Paid"]} job{by["Paid"] === 1 ? "" : "s"} now
            </Link>
          )}

          <section className="mt-8">
            <h2 className="text-lg font-bold">Bookings by status</h2>
            <ul className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-100">
              {ORDER.map((s) => (
                <li key={s} className="flex items-center justify-between p-3">
                  <StatusBadge status={s} />
                  <span className="font-semibold">{by[s] ?? 0}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
