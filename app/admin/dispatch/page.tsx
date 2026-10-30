import type { Metadata } from "next";
import AdminNav from "@/components/AdminNav";
import StatusBadge from "@/components/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import { assignJob } from "@/app/admin/actions";
import { formatNaira } from "@/lib/pricing";
import { formatLongDate } from "@/lib/booking";

export const metadata: Metadata = { title: "Dispatch | CleanPro" };

type Cleaner = { id: string; full_name: string; assigned_area: string | null };
type Job = {
  id: string; status: string; scheduled_date: string; scheduled_time_slot: string; address_text: string;
  landmark: string | null; bedrooms: number; bathrooms: number; calculated_price_ngn: number | string;
  cleaner_id: string | null; customer_id: string; job_done_photo_url: string | null;
  services: unknown; cleaners: unknown;
};

const SELECT =
  "id,status,scheduled_date,scheduled_time_slot,address_text,landmark,bedrooms,bathrooms,calculated_price_ngn,cleaner_id,customer_id,job_done_photo_url,services(name),cleaners(full_name)";

function JobRow({ job, cleaners, names, canAssign }: {
  job: Job; cleaners: Cleaner[]; names: Map<string, string>; canAssign: boolean;
}) {
  const service = job.services as { name: string } | null;
  const cleaner = job.cleaners as { full_name: string } | null;
  return (
    <li className="rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold">{service?.name ?? "Cleaning service"} · {formatNaira(Number(job.calculated_price_ngn))}</p>
        <StatusBadge status={job.status} />
      </div>
      <p className="mt-1 text-sm text-gray-800">{formatLongDate(job.scheduled_date)} · {job.scheduled_time_slot}</p>
      <p className="mt-1 text-sm text-gray-800">{job.address_text}{job.landmark ? ` (near ${job.landmark})` : ""}</p>
      <p className="mt-1 text-xs text-gray-600">
        Customer: {names.get(job.customer_id) ?? "Unknown"} · {job.bedrooms} bedroom(s)/office(s), {job.bathrooms} bathroom(s)
      </p>
      {cleaner && <p className="mt-1 text-sm font-medium text-gray-900">Cleaner: {cleaner.full_name}</p>}

      {canAssign && (
        <form action={assignJob} className="mt-3 flex gap-2">
          <input type="hidden" name="job_id" value={job.id} />
          <label htmlFor={`c-${job.id}`} className="sr-only">Choose a cleaner</label>
          <select id={`c-${job.id}`} name="cleaner_id" required defaultValue={job.cleaner_id ?? ""}
            className="h-12 min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 text-base">
            <option value="" disabled>Choose a cleaner</option>
            {cleaners.map((c) => (
              <option key={c.id} value={c.id}>{c.full_name}{c.assigned_area ? ` (${c.assigned_area})` : ""}</option>
            ))}
          </select>
          <button type="submit" className="h-12 shrink-0 rounded-lg bg-brand-700 px-4 font-semibold text-white hover:opacity-90">
            {job.cleaner_id ? "Reassign" : "Assign"}
          </button>
        </form>
      )}

      {job.status === "Completed" && job.job_done_photo_url && (
        <a href={job.job_done_photo_url} target="_blank" rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-semibold text-brand-700 underline">View job done photo</a>
      )}
    </li>
  );
}

function Section({ title, empty, children, count }: { title: string; empty: string; count: number; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold">{title} ({count})</h2>
      {count === 0 ? <p className="mt-2 text-sm text-gray-600">{empty}</p> : <ul className="mt-3 space-y-3">{children}</ul>}
    </section>
  );
}

export default async function DispatchPage({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  const { result } = await searchParams;
  const supabase = await createClient(); // RLS: only an admin gets rows back

  const [cleanersRes, waitingRes, activeRes, doneRes] = await Promise.all([
    supabase.from("cleaners").select("id,full_name,assigned_area").eq("is_active", true).order("full_name"),
    supabase.from("jobs").select(SELECT).eq("status", "Paid").is("cleaner_id", null).order("scheduled_date"),
    supabase.from("jobs").select(SELECT).in("status", ["Assigned", "In Progress"]).order("scheduled_date"),
    supabase.from("jobs").select(SELECT).eq("status", "Completed").order("created_at", { ascending: false }).limit(8),
  ]);

  const cleaners = (cleanersRes.data ?? []) as Cleaner[];
  const waiting = (waitingRes.data ?? []) as Job[];
  const active = (activeRes.data ?? []) as Job[];
  const done = (doneRes.data ?? []) as Job[];

  const ids = Array.from(new Set([...waiting, ...active, ...done].map((j) => j.customer_id)));
  const names = new Map<string, string>();
  if (ids.length > 0) {
    const { data: profiles } = await supabase.from("profiles").select("id,full_name").in("id", ids);
    (profiles ?? []).forEach((p) => names.set(p.id as string, (p.full_name as string) || "Customer"));
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Dispatch</h1>
      <p className="mb-6 mt-1 text-sm text-gray-600">Assign paid bookings to cleaners.</p>
      <AdminNav current="/admin/dispatch" />

      {result === "assigned" && (
        <div role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          <strong>Cleaner assigned.</strong> The job now appears on their list.
        </div>
      )}
      {result === "failed" && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <strong>Could not assign.</strong> The job may have already started, or that cleaner is not active.
        </div>
      )}
      {cleaners.length === 0 && (
        <p role="alert" className="mb-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
          There are no active cleaners yet, so jobs cannot be assigned.
        </p>
      )}

      <Section title="Needs a cleaner" count={waiting.length} empty="No paid bookings are waiting for a cleaner.">
        {waiting.map((j) => <JobRow key={j.id} job={j} cleaners={cleaners} names={names} canAssign />)}
      </Section>
      <Section title="Assigned and in progress" count={active.length} empty="Nothing is assigned right now.">
        {active.map((j) => <JobRow key={j.id} job={j} cleaners={cleaners} names={names} canAssign={j.status === "Assigned"} />)}
      </Section>
      <Section title="Recently completed" count={done.length} empty="No completed jobs yet.">
        {done.map((j) => <JobRow key={j.id} job={j} cleaners={cleaners} names={names} canAssign={false} />)}
      </Section>
    </main>
  );
}
