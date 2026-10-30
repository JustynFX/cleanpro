"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const { user, role } = await getSession();
  if (!user || role !== "admin") redirect("/login?refused_reason=unauthenticated");
}

/** Assign (or re-assign) a cleaner. Runs as the logged-in admin, so database rules (RLS) apply too. */
export async function assignJob(formData: FormData) {
  await requireAdmin();
  const jobId = String(formData.get("job_id") ?? "");
  const cleanerId = String(formData.get("cleaner_id") ?? "");

  const supabase = await createClient();
  const { data: cleaner } = await supabase
    .from("cleaners").select("id").eq("id", cleanerId).eq("is_active", true).maybeSingle();
  if (!cleaner) redirect("/admin/dispatch?result=failed");

  const { data: changed } = await supabase
    .from("jobs")
    .update({ cleaner_id: cleaner.id, status: "Assigned" })
    .eq("id", jobId)
    .in("status", ["Paid", "Assigned"]) // never touch a job that has started or finished
    .select("id");
  if (!changed || changed.length === 0) redirect("/admin/dispatch?result=failed");

  revalidatePath("/admin/dispatch");
  redirect("/admin/dispatch?result=assigned");
}

function naira(formData: FormData, key: string, min: number, max: number): number | null {
  const n = Number(String(formData.get(key) ?? "").trim());
  return Number.isFinite(n) && n >= min && n <= max ? Math.round(n) : null;
}

/** Update a service's base price and per-room rates. Only affects FUTURE bookings. */
export async function updateService(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("service_id") ?? "");
  const base = naira(formData, "base_price", 1000, 1_000_000);
  const bedroom = naira(formData, "bedroom_rate", 0, 100_000);
  const bathroom = naira(formData, "bathroom_rate", 0, 100_000);
  if (base === null || bedroom === null || bathroom === null) redirect("/admin/services?result=invalid");

  const supabase = await createClient();
  const { data: changed } = await supabase
    .from("services")
    .update({ base_price_ngn: base, bedroom_rate_ngn: bedroom, bathroom_rate_ngn: bathroom })
    .eq("id", id).select("id");
  if (!changed || changed.length === 0) redirect("/admin/services?result=invalid");

  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/admin/services");
  redirect("/admin/services?result=saved");
}
