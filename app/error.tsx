"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-gray-700">Please try again. If it keeps happening, contact CleanPro.</p>
      <button type="button" onClick={reset} className="mt-6 h-12 rounded-lg bg-brand-700 px-6 font-semibold text-white hover:opacity-90">
        Try again
      </button>
    </main>
  );
}
