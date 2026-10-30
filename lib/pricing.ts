// Client-safe pricing. The browser calculator is only a PREVIEW.
// In Phase 3 the server recalculates from the database before charging.
export interface ServicePricing {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  bedroomRate: number;
  bathroomRate: number;
}

export const MAX_ROOMS = 20;

export const FALLBACK_SERVICES: ServicePricing[] = [
  { id: "fallback-std", name: "Standard Deep Clean", description: "Thorough home cleaning covering all accessible rooms, dusting, and mopping.", basePrice: 10000, bedroomRate: 2500, bathroomRate: 1500 },
  { id: "fallback-move", name: "Move-In / Move-Out Clean", description: "Heavy-duty deep cleaning for vacant apartments or new properties.", basePrice: 18000, bedroomRate: 2500, bathroomRate: 1500 },
  { id: "fallback-office", name: "Office & Commercial Clean", description: "Professional sanitization and cleaning for office spaces and desks.", basePrice: 25000, bedroomRate: 2500, bathroomRate: 1500 },
];

export function clampRooms(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(MAX_ROOMS, Math.max(1, Math.floor(n)));
}

export function calculatePrice(s: ServicePricing, bedrooms: number, bathrooms: number): number {
  return s.basePrice + clampRooms(bedrooms) * s.bedroomRate + clampRooms(bathrooms) * s.bathroomRate;
}

export function formatNaira(n: number): string {
  return "₦" + n.toLocaleString("en-NG");
}
