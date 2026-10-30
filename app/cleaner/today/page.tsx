import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, MapPin } from "lucide-react";
import RefusedBanner from "@/components/RefusedBanner";
import StatusBadge from "@/components/StatusBadge";
import { createClient } from "@/lib/supabase/server";
import { TIME_SLOTS, formatLongDate, lagosToday } from "@/lib/booking";

export const metadata: Metadata = { title: "Today's jobs | CleanPro" };

type Job = {
  id: string; status: string; scheduled_date: string; scheduled_time_slot: string;
  address_text: string; landmark: string | null; bedrooms: number; bathrooms: number;
  services: unknown;
};

function JobCard({ job }: { job: Job }) {
  const service = job.services as { name: string } | null;
  return (
    <li>
      <Link href={`/cleaner/jobs/${job.id}`} className="block rounded-xl border border-gray-100 p-4 shadow-sm hover:bg-gray-50">
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold">{service?.name ?? "Cleaning service"}</p>
          <StatusBadge status={job.status} />
        </div>
        <p className="mt-2 flex items-center gap-2 text-sm text-gray-800">
          <CalendarClock aria-hidden="true" className="h-4 w-4" /> {formatLongDate(job.scheduled_date)} · {job.scheduled_time_slot}
        </p>
        <p className="mt-1 flex items-start gap-2 text-sm text-gray-800">
          <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{job.address_text}{job.landmark ? ` (near ${job.landmark})` : ""}</span>
        </p>
        <p className="mt-1 text-xs text-gray-600">{job.bedrooms} bedroom(s)/office(s) · {job.bathrooms} bathroom(s)</p>
      </Link>
    </li>
  );
}

function Section({ title, jobs }: { title: string; jobs: Job[] }) {
  if (jobs.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold">{title} ({jobs.length})</h2>
      <ul className="mt-3 space-y-3">{jobs.map((j) => <JobCard key={j.id} job={j} />)}</ul>
    </section>
  );
}

export default async function CleanerToday({ searchParams }: { searchParams: Promise<{ error?: string; done?: string }> }) {
  const { error, done } = await searchParams;
  const supabase = await createClient(); // RLS: only jobs assigned to this cleaner
  const { data: cleaner } = await supabase.from("cleaners").select("id,full_name,assigned_area").maybeSingle();
  const { data } = await supabase
    .from("jobs")
    .select("id,status,scheduled_date,scheduled_time_slot,address_text,landmark,bedrooms,bathrooms,services(name)")
    .in("status", ["Assigned", "In Progress"]);

  const slot = (s: string) => {
    const i = (TIME_SLOTS as readonly string[]).indexOf(s);
    return i < 0 ? 99 : i;
  };
  const jobs = ([...(data ?? [])] as Job[]).sort(
    (a, b) => a.scheduled_date.localeCompare(b.scheduled_date) || slot(a.scheduled_time_slot) - slot(b.scheduled_time_slot)
  );
  const today = lagosToday();
  const overdue = jobs.filter((j) => j.scheduled_date < today);
  const todays = jobs.filter((j) => j.scheduled_date === today);
  const upcoming = jobs.filter((j) => j.scheduled_date > today);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <RefusedBanner error={error} />
      {done === "1" && (
        <div role="status" className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          <strong>Job completed.</strong> The customer has been sent your photo.
        </div>
      )}
      <h1 className="text-2xl font-bold">Today&apos;s jobs</h1>
      <p className="mt-1 text-sm text-gray-600">
        {cleaner ? `${cleaner.full_name} · ${cleaner.assigned_area}` : "Your cleaner profile is not set up yet. Please ask the admin."}
      </p>

      {jobs.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-700">
          No jobs assigned to you right now. New jobs appear here when the admin assigns them.
        </div>
      ) : (
        <>
          <Section title="Overdue" jobs={overdue} />
          <Section title="Today" jobs={todays} />
          <Section title="Upcoming" jobs={upcoming} />
          {todays.length === 0 && overdue.length === 0 && (
            <p className="mt-6 text-sm text-gray-700">Nothing scheduled for today. Your upcoming jobs are below.</p>
          )}
        </>
      )}
    </main>
  );
}
