export type Role = "customer" | "cleaner" | "admin";

export const ROLE_HOME: Record<Role, string> = {
  customer: "/dashboard/bookings",
  cleaner: "/cleaner/today",
  admin: "/admin/overview",
};

/** Which URL prefix belongs to which role. */
export const ROUTE_ROLE: { prefix: string; role: Role }[] = [
  { prefix: "/dashboard", role: "customer" },
  { prefix: "/cleaner", role: "cleaner" },
  { prefix: "/admin", role: "admin" },
];
