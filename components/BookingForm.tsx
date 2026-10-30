"use client";

import { useActionState, useState } from "react";
import { createBooking, type BookingState } from "@/app/dashboard/actions";
import { MAX_ROOMS, calculatePrice, clampRooms, formatNaira, type ServicePricing } from "@/lib/pricing";
import { TIME_SLOTS } from "@/lib/booking";

const initial: BookingState = {};
const field = "h-12 w-full rounded-lg border border-gray-300 bg-white px-3 text-base text-gray-900";
const area = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900";

export default function BookingForm(props: {
  services: ServicePricing[];
  initialServiceId: string;
  initialBedrooms: number;
  initialBathrooms: number;
  minDate: string;
  maxDate: string;
}) {
  const [state, action, pending] = useActionState(createBooking, initial);
  const [serviceId, setServiceId] = useState(props.initialServiceId);
  const [bedrooms, setBedrooms] = useState(props.initialBedrooms);
  const [bathrooms, setBathrooms] = useState(props.initialBathrooms);

  const service = props.services.find((s) => s.id === serviceId) ?? props.services[0];
  const total = calculatePrice(service, bedrooms, bathrooms);

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="service_id" className="mb-1 block text-sm font-medium">Cleaning type</label>
        <select id="service_id" name="service_id" value={serviceId} onChange={(e) => setServiceId(e.target.value)} className={field}>
          {props.services.map((s) => (
            <option key={s.id} value={s.id}>{s.name} (from {formatNaira(s.basePrice)})</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="bedrooms" className="mb-1 block text-sm font-medium">Bedrooms / offices</label>
          <input id="bedrooms" name="bedrooms" type="number" inputMode="numeric" min={1} max={MAX_ROOMS} required
            value={bedrooms} onChange={(e) => setBedrooms(clampRooms(Number(e.target.value)))} className={field} />
        </div>
        <div>
          <label htmlFor="bathrooms" className="mb-1 block text-sm font-medium">Bathrooms / restrooms</label>
          <input id="bathrooms" name="bathrooms" type="number" inputMode="numeric" min={1} max={MAX_ROOMS} required
            value={bathrooms} onChange={(e) => setBathrooms(clampRooms(Number(e.target.value)))} className={field} />
        </div>
      </div>

      <div>
        <label htmlFor="address" className="mb-1 block text-sm font-medium">Full street address</label>
        <textarea id="address" name="address" rows={3} required minLength={10} maxLength={300}
          placeholder="House number, street and area, e.g. Uselu, Benin City" className={area} />
      </div>

      <div>
        <label htmlFor="landmark" className="mb-1 block text-sm font-medium">Nearest landmark (optional)</label>
        <input id="landmark" name="landmark" type="text" maxLength={150}
          placeholder="e.g. Opposite the filling station" className={field} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="mb-1 block text-sm font-medium">Date</label>
          <input id="date" name="date" type="date" required min={props.minDate} max={props.maxDate} className={field} />
        </div>
        <div>
          <label htmlFor="slot" className="mb-1 block text-sm font-medium">Time slot</label>
          <select id="slot" name="slot" required defaultValue="" className={field}>
            <option value="" disabled>Choose a time</option>
            {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="mb-1 block text-sm font-medium">Notes for the cleaner (optional)</label>
        <textarea id="notes" name="notes" rows={2} maxLength={500} placeholder="Gate code, pets, areas to focus on" className={area} />
      </div>

      <div className="rounded-xl bg-brand-50 p-4">
        <p className="text-xs uppercase tracking-wider text-gray-600">Estimated total</p>
        <p className="text-3xl font-extrabold text-brand-700" aria-live="polite">{formatNaira(total)}</p>
        <p className="mt-1 text-xs text-gray-600">The final price is confirmed by our server when you continue.</p>
      </div>

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{state.error}</p>
      )}

      <button type="submit" disabled={pending}
        className="h-12 w-full rounded-lg bg-brand-700 font-semibold text-white hover:opacity-90 disabled:opacity-60">
        {pending ? "Preparing secure payment..." : "Continue to payment"}
      </button>
      <p className="text-center text-xs text-gray-600">Payment runs in Paystack test mode. No real money is charged.</p>
    </form>
  );
}
