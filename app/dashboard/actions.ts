"use server";

import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { calculatePrice, clampRooms } from "@/lib/pricing";
import { TIME_SLOTS, validateDate } from "@/lib/booking";
import { beginCheckout } from "@/lib/payments";

export type BookingState = { error?: string };

/** Creates the job on the SERVER. The price is calculated here from the database, never taken from the browser. */
export async function createBooking(_prev: BookingState, formData: FormData): Promise<BookingState> {
  const { user, role } = await getSession();
  if (!user) redirect("/login?refused_reason=unauthenticated&next=/dashboard/book");
  if (role !== "customer") return { error: "Only customer accounts can book a clean." };
  if (!user.email) return { error: "Your account has no email address." };

  const serviceId = String(formData.get("service_id") ?? "");
  const bedrooms = clampRooms(Number(formData.get("bedrooms")));
  const bathrooms = clampRooms(Number(formData.get("bathrooms")));
  const address = String(formData.get("address") ?? "").trim();
  const landmark = String(formData.get("landmark") ?? "").trim();
  const date = String(formData.get("date") ?? "");
  const slot = String(formData.get("slot") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (address.length < 10) return { error: "Enter the full street address so your cleaner can find you." };
  if (address.length > 300) return { error: "The address is too long." };
  if (landmark.length > 150) return { error: "The landmark is too long (150 characters at most)." };
  if (notes.length > 500) return { error: "Notes are too long (500 characters at most)." };
  const dateError = validateDate(date);
  if (dateError) return { error: dateError };
  if (!(TIME_SLOTS as readonly string[]).includes(slot)) return { error: "Choose a time slot." };

  const supabase = await createClient();
  const { data: service } = await supabase
    .from("services")
    .select("id,name,description,base_price_ngn,bedroom_rate_ngn,bathroom_rate_ngn")
    .eq("id", serviceId).single();
  if (!service) return { error: "Please choose a valid service." };

  const price = calculatePrice(
    {
      id: service.id, name: service.name, description: service.description,
      basePrice: Number(service.base_price_ngn),
      bedroomRate: Number(service.bedroom_rate_ngn ?? 2500),
      bathroomRate: Number(service.bathroom_rate_ngn ?? 1500),
    },
    bedrooms, bathrooms
  );

  const svc = createServiceClient();
  const { data: job, error } = await svc
    .from("jobs")
    .insert({
      customer_id: user.id,
      service_id: service.id,
      bedrooms, bathrooms,
      property_type: /office|commercial/i.test(service.name) ? "Commercial" : "Residential",
      calculated_price_ngn: price,
      address_text: address,
      landmark: landmark || null,
      scheduled_date: date,
      scheduled_time_slot: slot,
      notes: notes || null,
      status: "Pending",
    })
    .select("id,calculated_price_ngn").single();
  if (error || !job) {
    console.error("[BOOKING] insert failed:", error);
    return { error: "We could not save your booking. Please try again." };
  }

  let checkoutUrl: string | null = null;
  try {
    checkoutUrl = await beginCheckout(job, user.email);
  } catch (e) {
    console.error("[CHECKOUT]", e);
  }
  // redirect() must stay outside try/catch
  redirect(checkoutUrl ?? `/dashboard/bookings/${job.id}?payment=error`);
}

/** "Pay now" for a booking that is still Pending (abandoned or failed checkout). */
export async function payNow(formData: FormData) {
  const jobId = String(formData.get("job_id") ?? "");
  const { user, role } = await getSession();
  if (!user || role !== "customer" || !user.email) redirect("/login?refused_reason=unauthenticated");

  const supabase = await createClient(); // RLS: only the customer's own jobs are visible
  const { data: job } = await supabase
    .from("jobs").select("id,status,calculated_price_ngn").eq("id", jobId).single();
  if (!job || job.status !== "Pending") redirect("/dashboard/bookings");

  let checkoutUrl: string | null = null;
  try {
    checkoutUrl = await beginCheckout(job, user.email);
  } catch (e) {
    console.error("[CHECKOUT]", e);
  }
  redirect(checkoutUrl ?? `/dashboard/bookings/${jobId}?payment=error`);
}
