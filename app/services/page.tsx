import type { Metadata } from "next";
import Link from "next/link";
import { getServices } from "@/lib/services";
import { formatNaira } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Cleaning Services & Prices in Benin City | CleanPro",
  description:
    "See CleanPro's cleaning services and Naira prices: standard deep clean, move-in and move-out clean, and office cleaning in Benin City.",
};

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-extrabold">Our cleaning services</h1>
      <p className="mt-2 max-w-2xl text-gray-700">
        Every price starts from a base rate and grows with the size of your property, so you only pay for the space you
        have.
      </p>
      <ul className="mt-8 grid gap-5 md:grid-cols-3">
        {services.map((s) => (
          <li key={s.id} className="flex flex-col rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold">{s.name}</h2>
            <p className="mt-2 flex-1 text-sm text-gray-700">{s.description}</p>
            <p className="mt-4 text-2xl font-extrabold text-brand-700">
              <span className="text-sm font-medium text-gray-600">from </span>{formatNaira(s.basePrice)}
            </p>
            <p className="mt-1 text-xs text-gray-600">
              + {formatNaira(s.bedroomRate)} per bedroom or office, + {formatNaira(s.bathroomRate)} per bathroom
            </p>
          </li>
        ))}
      </ul>
      <Link href="/#calculator" className="mt-8 inline-flex h-12 items-center rounded-lg bg-brand-700 px-6 font-semibold text-white hover:opacity-90">
        Get my exact price
      </Link>
    </main>
  );
}
