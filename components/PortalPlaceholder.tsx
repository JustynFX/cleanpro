import { getSession } from "@/lib/auth";
import RefusedBanner from "@/components/RefusedBanner";

export default async function PortalPlaceholder({
  title, coming, error,
}: { title: string; coming: string; error?: string }) {
  const { user, role } = await getSession();
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <RefusedBanner error={error} />
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-gray-600">
        Signed in as <strong>{user?.email}</strong> with the role <strong>{role}</strong>.
      </p>
      <p className="mt-4 rounded-lg bg-gray-50 p-4 text-gray-700">{coming}</p>
    </main>
  );
}
