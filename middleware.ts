import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROLE_HOME, ROUTE_ROLE, type Role } from "@/lib/roles";

/**
 * Role gate. The role is read from the `profiles` table for the verified Supabase user.
 * It is NEVER read from a plain cookie, because browser cookies can be edited by anyone.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser(); // verifies the JWT with Supabase

  if (!user) {
    console.warn(`[REFUSED] unauthenticated -> ${pathname}`);
    const url = new URL("/login", req.url);
    url.searchParams.set("refused_reason", "unauthenticated");
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role as Role | undefined;
  const required = ROUTE_ROLE.find((r) => pathname.startsWith(r.prefix))?.role;

  if (!role || (required && role !== required)) {
    console.warn(`[REFUSED] role=${role ?? "none"} -> ${pathname}`);
    const url = new URL(role ? ROLE_HOME[role] : "/login", req.url);
    url.searchParams.set("error", "refused_access_unauthorized_role");
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/cleaner/:path*", "/admin/:path*"],
};
