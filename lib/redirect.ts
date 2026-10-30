import { ROLE_HOME, ROUTE_ROLE, type Role } from "@/lib/roles";

/** Only allow same-site paths, and never send someone to another role's area. */
export function safeRedirect(next: string | null | undefined, role: Role): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return ROLE_HOME[role];
  const owner = ROUTE_ROLE.find((r) => next.startsWith(r.prefix));
  if (owner && owner.role !== role) return ROLE_HOME[role];
  return next;
}
