export function mapsUrl(address: string): string {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${address}, Benin City, Edo State`);
}
