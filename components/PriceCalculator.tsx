"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { MAX_ROOMS, calculatePrice, clampRooms, formatNaira, type ServicePricing } from "@/lib/pricing";

function Stepper({ label, hint, value, onChange }: { label: string; hint: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-600">{hint}</p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} onClick={() => onChange(clampRooms(value - 1))}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300">
          <Minus aria-hidden="true" className="h-4 w-4" />
        </button>
        <span aria-live="polite" className="w-8 text-center text-lg font-semibold">{value}</span>
        <button type="button" aria-label={`More ${label.toLowerCase()}`} onClick={() => onChange(clampRooms(value + 1))} disabled={value >= MAX_ROOMS}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-40">
          <Plus aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function PriceCalculator({ services }: { services: ServicePricing[] }) {
  const [serviceId, setServiceId] = useState(services[0].id);
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);

  const service = services.find((s) => s.id === serviceId) ?? services[0];
  const total = calculatePrice(service, bedrooms, bathrooms);
  const bookHref = `/dashboard/book?service=${encodeURIComponent(service.id)}&bedrooms=${bedrooms}&bathrooms=${bathrooms}`;

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
      <h2 className="text-xl font-bold text-gray-900">Instant price calculator</h2>
      <p className="mt-1 text-sm text-gray-600">Pick a service and your property size. No phone call needed.</p>

      <div className="mt-5">
        <label htmlFor="service" className="mb-1 block text-sm font-medium text-gray-700">Cleaning type</label>
        <select id="service" value={serviceId} onChange={(e) => setServiceId(e.target.value)}
          className="h-12 w-full rounded-lg border border-gray-300 bg-white px-3 text-base text-gray-900">
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.name} (from {formatNaira(s.basePrice)})</option>
          ))}
        </select>
      </div>

      <div className="mt-4 space-y-3">
        <Stepper label="Bedrooms / offices" hint={`+${formatNaira(service.bedroomRate)} each`} value={bedrooms} onChange={setBedrooms} />
        <Stepper label="Bathrooms / restrooms" hint={`+${formatNaira(service.bathroomRate)} each`} value={bathrooms} onChange={setBathrooms} />
      </div>

      <dl className="mt-5 space-y-1 border-t border-gray-100 pt-4 text-sm text-gray-700">
        <div className="flex justify-between"><dt>{service.name}</dt><dd>{formatNaira(service.basePrice)}</dd></div>
        <div className="flex justify-between"><dt>{bedrooms} × bedroom / office</dt><dd>{formatNaira(bedrooms * service.bedroomRate)}</dd></div>
        <div className="flex justify-between"><dt>{bathrooms} × bathroom / restroom</dt><dd>{formatNaira(bathrooms * service.bathroomRate)}</dd></div>
      </dl>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-gray-100 pt-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-600">Estimated total</p>
          <p className="text-3xl font-extrabold text-brand-700" aria-live="polite">{formatNaira(total)}</p>
        </div>
        <Link href={bookHref} className="flex h-12 items-center rounded-lg bg-brand-700 px-5 font-semibold text-white hover:opacity-90">
          Book this clean
        </Link>
      </div>
    </div>
  );
}
