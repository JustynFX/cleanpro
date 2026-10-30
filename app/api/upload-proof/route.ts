import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { MAX_PHOTO_BYTES, sniffImage } from "@/lib/images";
import { sendJobCompletedEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** Cleaner uploads the job-done photo. This is what closes the job. */
export async function POST(req: Request) {
  const { user, role } = await getSession();
  if (!user || role !== "cleaner") {
    console.warn(`[REFUSED] upload-proof by role=${role ?? "none"}`);
    return fail("Only cleaners can upload job photos.", 403);
  }

  const form = await req.formData();
  const jobId = String(form.get("jobId") ?? "");
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("Choose a photo first.", 400);
  if (file.size > MAX_PHOTO_BYTES) return fail("That photo is too large. Please try again.", 413);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniffImage(bytes);
  if (!kind) return fail("Only JPEG, PNG or WebP photos are allowed.", 400);

  // Which cleaner is this? (RLS lets a cleaner read only their own row)
  const supabase = await createClient();
  const { data: cleaner } = await supabase.from("cleaners").select("id").eq("user_id", user.id).maybeSingle();
  if (!cleaner) return fail("Your cleaner profile is not set up.", 403);

  const svc = createServiceClient();
  const { data: job } = await svc
    .from("jobs").select("id,status,customer_id,cleaner_id").eq("id", jobId).maybeSingle();
  if (!job || job.cleaner_id !== cleaner.id) {
    console.warn(`[REFUSED] cleaner ${cleaner.id} tried to upload to job ${jobId} not assigned to them`);
    return fail("Job not found.", 404);
  }
  if (job.status !== "In Progress") return fail("Start the job before uploading the completion photo.", 409);

  const path = `${job.id}/${randomUUID()}.${kind.ext}`;
  const { error: upErr } = await svc.storage.from("job-photos").upload(path, bytes, { contentType: kind.mime, upsert: false });
  if (upErr) {
    console.error("[UPLOAD] storage error:", upErr);
    return fail("Photo upload failed. Please try again.", 500);
  }
  const photoUrl = svc.storage.from("job-photos").getPublicUrl(path).data.publicUrl;

  const { data: changed } = await svc
    .from("jobs")
    .update({ status: "Completed", job_done_photo_url: photoUrl })
    .eq("id", job.id).eq("status", "In Progress").select("id");
  if (!changed || changed.length === 0) {
    await svc.storage.from("job-photos").remove([path]);
    return fail("This job was already completed.", 409);
  }

  // Automation: email the customer the photo
  const { data: userRes } = await svc.auth.admin.getUserById(job.customer_id as string);
  const { data: profile } = await svc.from("profiles").select("full_name").eq("id", job.customer_id).maybeSingle();
  const email = userRes?.user?.email;
  if (email) await sendJobCompletedEmail(email, profile?.full_name || email.split("@")[0], photoUrl);

  return NextResponse.json({ url: photoUrl });
}
