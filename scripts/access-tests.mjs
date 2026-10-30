// Automated "refused access" checks for people who are NOT logged in, plus the API doors.
// Usage:  node scripts/access-tests.mjs http://localhost:3000
//         node scripts/access-tests.mjs https://your-live-link.vercel.app
// Role-vs-role tests (customer -> admin, etc.) need a login, so do those by hand (see docs/TESTING.md).
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
let failed = 0;

function report(ok, name, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  -> " + detail : ""}`);
  if (!ok) failed++;
}

const REDIRECTS = [301, 302, 303, 307, 308];
const PROTECTED = [
  "/admin/overview", "/admin/dispatch", "/admin/services",
  "/cleaner/today", "/dashboard/bookings", "/dashboard/book",
];

console.log(`Testing ${base}\n`);

for (const path of PROTECTED) {
  const res = await fetch(base + path, { redirect: "manual" });
  const loc = res.headers.get("location") ?? "";
  const ok = REDIRECTS.includes(res.status) && loc.includes("/login") && loc.includes("refused_reason=unauthenticated");
  report(ok, `logged out: ${path} is refused`, `${res.status} ${loc}`);
}

for (const path of ["/", "/services", "/login", "/robots.txt", "/sitemap.xml"]) {
  const res = await fetch(base + path, { redirect: "manual" });
  report(res.status === 200, `public page ${path} loads`, String(res.status));
}

{
  const res = await fetch(base + "/api/paystack/webhook", {
    method: "POST",
    headers: { "content-type": "application/json", "x-paystack-signature": "not-a-real-signature" },
    body: JSON.stringify({ event: "charge.success", data: { reference: "fake" } }),
  });
  report(res.status === 401, "webhook with a fake signature is refused", String(res.status));
}

{
  const form = new FormData();
  form.append("jobId", "00000000-0000-0000-0000-000000000000");
  form.append("file", new Blob(["x"], { type: "image/jpeg" }), "x.jpg");
  const res = await fetch(base + "/api/upload-proof", { method: "POST", body: form, redirect: "manual" });
  report(res.status === 403, "logged out: photo upload API is refused", String(res.status));
}

console.log(failed === 0 ? "\nAll checks passed." : `\n${failed} check(s) FAILED.`);
process.exit(failed === 0 ? 0 : 1);
