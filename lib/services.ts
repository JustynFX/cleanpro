import { createClient } from "@/lib/supabase/server";
import { FALLBACK_SERVICES, type ServicePricing } from "@/lib/pricing";

/** Reads services from Supabase. Falls back to the seed prices so the page never breaks. */
export async function getServices(): Promise<ServicePricing[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select("id,name,description,base_price_ngn,bedroom_rate_ngn,bathroom_rate_ngn")
      .order("base_price_ngn", { ascending: true });
    if (error || !data || data.length === 0) return FALLBACK_SERVICES;
    return data.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      description: (r.description as string | null) ?? null,
      basePrice: Number(r.base_price_ngn),
      bedroomRate: Number(r.bedroom_rate_ngn ?? 2500),
      bathroomRate: Number(r.bathroom_rate_ngn ?? 1500),
    }));
  } catch {
    return FALLBACK_SERVICES;
  }
}
