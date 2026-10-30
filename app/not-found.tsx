import Link from "next/link";

export const metadata = { title: "Page not found | CleanPro" };

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-4 py-20 text-center">
      <p className="text-5xl font-extrabold text-brand-700">404</p>
      <h1 className="mt-3 text-2xl font-bold">We could not find that page</h1>
      <p className="mt-2 text-gray-700">The link may be old, or the page may belong to another account.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/" className="flex h-12 items-center rounded-lg bg-brand-700 px-5 font-semibold text-white hover:opacity-90">Go to home</Link>
        <Link href="/login" className="flex h-12 items-center rounded-lg border border-gray-300 px-5 font-semibold hover:bg-gray-50">Log in</Link>
      </div>
    </main>
  );
}
