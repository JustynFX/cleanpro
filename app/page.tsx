import type { Metadata } from "next";
import { Calculator, CalendarCheck, Camera, SprayCan } from "lucide-react";
import PriceCalculator from "@/components/PriceCalculator";
import { getServices } from "@/lib/services";

export const metadata: Metadata = {
  title: "Home & Office Cleaning in Benin City | Instant Price | CleanPro",
  description:
    "Know your cleaning price in seconds. CleanPro cleans homes and offices across Benin City, from Ugbowo to GRA. Book online and get photo proof of the finished job.",
};

const STEPS = [
  { icon: Calculator, title: "Get your price", text: "Choose a service and tell us your bedrooms and bathrooms. The price appears instantly." },
  { icon: CalendarCheck, title: "Book and pay online", text: "Pick a date and time, enter your address and landmark, and pay securely online." },
  { icon: SprayCan, title: "Your cleaner arrives", text: "Your cleaner sees your exact address on their phone, so no more missed directions." },
  { icon: Camera, title: "See the proof", text: "Every job ends with a photo from the cleaner, which you can view in your account." },
];

const AREAS = ["Ugbowo", "GRA", "Ring Road", "Uselu", "Sapele Road", "Airport Road", "Aduwawa", "Oluku"];

export default async function HomePage() {
  const services = await getServices();
  return (
    <main>
      <section className="bg-brand-50">
        <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-2 md:items-center md:py-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Cleaning in Benin City</p>
            <h1 className="mt-2 text-4xl font-extrabold leading-tight text-gray-900">
              A spotless home or office. Your price in seconds.
            </h1>
            <p className="mt-4 text-lg text-gray-700">
              No long phone calls and no guessing. Tell us the size of your place, see the price, book, and get a photo
              when the job is done.
            </p>
            <a href="#calculator" className="mt-6 inline-flex h-12 items-center rounded-lg bg-brand-700 px-6 font-semibold text-white hover:opacity-90">
              Calculate my price
            </a>
          </div>
          <div id="calculator" className="flex justify-center md:justify-end">
            <PriceCalculator services={services} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pt-14">
        <h2 className="text-2xl font-bold">How CleanPro works</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="flex gap-4 rounded-xl border border-gray-100 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold">{i + 1}. {title}</h3>
                <p className="mt-1 text-sm text-gray-700">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-5xl px-4 pt-14">
        <h2 className="text-2xl font-bold">Where we clean</h2>
        <p className="mt-2 text-gray-700">We serve homes and offices across Benin City, including:</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {AREAS.map((a) => (
            <li key={a} className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800">{a}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
