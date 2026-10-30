import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import CleanerPhotoUpload from "@/components/CleanerPhotoUpload";
import { createClient } from "@/lib/supabase/server";
import { startJob } from "@/app/cleaner/actions";
import { formatLongDate } from "@/lib/booking";
import { mapsUrl } from "@/lib/maps";

export const metadata: Metadata = { title: "Job details | CleanPro" };

export default async function CleanerJob({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient(); // RLS: jobs not assigned to this cleaner are invisible -> 404
  const { data: job } = await supabase.from("jobs").select("*, services(name)").eq("id", id).maybeSingle();
  if (!job) notFound();
  const service = job.services as unknown as { name: string } | null;

  const rows: [string, string][] = [
    ["Date", formatLongDate(job.scheduled_date)],
    ["Time", job.scheduled_time_slot],
    ["Property", `${job.bedrooms} bedroom(s)/office(s), ${job.bathrooms} bathroom(s)`],
    ["Address", job.address_text],
    ...(job.landmark ? ([["Landmark", job.landmark]] as [string, string][]) : []),
    ...(job.notes ? ([["Customer notes", job.notes]] as [string, string][]) : []),
  ];

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/cleaner/today" className="text-sm font-medium text-brand-700 underline">&larr; Today&apos;s jobs</Link>

      <div className="mt-4 flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold">{service?.name ?? "Cleaning service"}</h1>
        <StatusBadge status={job.status} />
      </div>

      <dl className="mt-6 divide-y divide-gray-100 rounded-xl border border-gray-100 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 p-3">
            <dt className="text-gray-600">{k}</dt>
            <dd className="text-right font-medium text-gray-900">{v}</dd>
          </div>
        ))}
      </dl>

      <a href={mapsUrl(job.address_text)} target="_blank" rel="noopener noreferrer"
        className="mt-4 flex h-12 items-center justify-center gap-2 rounded-lg border border-gray-300 font-semibold text-gray-900 hover:bg-gray-50">
        <ExternalLink aria-hidden="true" className="h-4 w-4" /> Open address in Google Maps
      </a>

      <div className="mt-6">
        {job.status === "Assigned" && (
          <form action={startJob}>
            <input type="hidden" name="job_id" value={job.id} />
            <button type="submit" className="h-12 w-full rounded-lg bg-brand-700 font-semibold text-white hover:opacity-90">
              Start job
            </button>
          </form>
        )}
        {job.status === "In Progress" && <CleanerPhotoUpload jobId={job.id} />}
        {job.status === "Completed" && job.job_done_photo_url && (
          <section>
            <h2 className="text-lg font-bold">Job done photo</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={job.job_done_photo_url} alt="The completion photo you uploaded for this job"
              className="mt-3 w-full rounded-xl border border-gray-100 object-cover" />
            <p className="mt-2 text-sm text-gray-600">This job is complete. The customer has been sent this photo.</p>
          </section>
        )}
      </div>
    </main>
  );
}
