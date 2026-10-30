import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getSession } from "@/lib/auth";
import { safeRedirect } from "@/lib/redirect";

export const metadata: Metadata = {
  title: "Log in or create an account | CleanPro",
  description: "Log in to book a clean, manage your jobs or run the CleanPro dashboard.",
};

type SP = { [key: string]: string | undefined };

export default async function LoginPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { user, role } = await getSession();
  if (user && role) redirect(safeRedirect(sp.next, role));

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">Welcome to CleanPro</h1>
      <p className="mt-1 text-sm text-gray-600">Log in, or create a customer account to book your first clean.</p>

      {sp.refused_reason === "unauthenticated" && (
        <div role="alert" className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Please log in first.</strong> That page is only for signed-in users.
        </div>
      )}
      {sp.error === "refused_access_unauthorized_role" && (
        <div role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <strong>Access refused.</strong> Your account does not have permission to open that page.
        </div>
      )}

      <div className="mt-6">
        <AuthForm next={sp.next ?? ""} />
      </div>
    </main>
  );
}
