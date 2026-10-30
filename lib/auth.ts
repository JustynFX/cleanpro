import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/roles";

export interface SessionInfo {
  user: { id: string; email?: string } | null;
  role: Role | null;
}

/** Verified user + role from the profiles table. Never throws. */
export async function getSession(): Promise<SessionInfo> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { user: null, role: null };
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    return { user: { id: user.id, email: user.email }, role: (data?.role ?? null) as Role | null };
  } catch {
    return { user: null, role: null };
  }
}
