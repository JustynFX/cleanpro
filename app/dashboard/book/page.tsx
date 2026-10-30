import type { Metadata } from "next";
import RefusedBanner from "@/components/RefusedBanner";
import BookingForm from "@/components/BookingForm";
import { getServices } from "@/lib/services";
import { clampRooms } from "@/lib/pricing";
import { addDays, lagosToday } from "@/lib/booking";

export const metadata: Metadata = { title: "Book a clean | CleanPro" };

type SP = { [key: string]: string | undefined };

export default async function BookPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const services = await getServices();
  const dbDown = services.some((s) => s.id.startsWith("fallback-"));
  const initialServiceId = services.find((s) => s.id === sp.service)?.id ?? services[0].id;
  const today = lagosToday();

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <RefusedBanner error={sp.error} />
      <h1 className="text-2xl font-bold">Book a clean</h1>
      <p className="mt-1 text-sm text-gray-600">Tell us where and when. You pay online to confirm the booking.</p>
      {dbDown && (
        <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Our price list could not be loaded, so booking is unavailable right now. Please try again shortly.
        </p>
      )}
      <div className="mt-6">
        <BookingForm
          services={services}
          initialServiceId={initialServiceId}
          initialBedrooms={clampRooms(Number(sp.bedrooms))}
          initialBathrooms={clampRooms(Number(sp.bathrooms))}
          minDate={addDays(today, 1)}
          maxDate={addDays(today, 60)}
        />
      </div>
    </main>
  );
}
