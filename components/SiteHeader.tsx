import Link from "next/link";
import { Sparkles, LogOut } from "lucide-react";
import { getSession } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/roles";
import { signout } from "@/app/login/actions";

export default async function SiteHeader() {
  const { user, role } = await getSession();
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-brand-700">
          <Sparkles aria-hidden="true" className="h-5 w-5" /> CleanPro
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 text-sm font-medium">
          <Link href="/services" className="rounded-lg px-3 py-3 hover:bg-gray-50">Services</Link>
          {user && role ? (
            <>
              <Link href={ROLE_HOME[role]} className="rounded-lg px-3 py-3 hover:bg-gray-50">My portal</Link>
              <form action={signout}>
                <button type="submit" className="flex items-center gap-1 rounded-lg px-3 py-3 hover:bg-gray-50">
                  <LogOut aria-hidden="true" className="h-4 w-4" /> Log out
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="rounded-lg bg-brand-700 px-4 py-3 text-white hover:opacity-90">Log in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
