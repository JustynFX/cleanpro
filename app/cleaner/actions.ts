"use server";

import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";

/** Assigned -> In Progress. Only the cleaner the job is assigned to can do this. */
export async function startJob(formData: FormData) {
  const jobId = String(formData.get("job_id") ?? "");
  const { user, role } = await getSession();
  if (!user || role !== "cleaner") redirect("/login?refused_reason=unauthenticated");

  const supabase = await createClient(); // RLS: a cleaner only sees jobs assigned to them
  const { data: job } = await supabase.from("jobs").select("id,status").eq("id", jobId).maybeSingle();
  if (!job || job.status !== "Assigned") redirect("/cleaner/today");

  const svc = createServiceClient();
  await svc.from("jobs").update({ status: "In Progress" }).eq("id", jobId).eq("status", "Assigned");
  redirect(`/cleaner/jobs/${jobId}`);
}
