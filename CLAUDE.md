# CleanPro (#22): working rules

Cleaning company in Benin City, Edo State. Tech4Youth Edo Module 06 individual project.
Roles: customer, cleaner, admin. Special feature: instant price from home size.

## Non-negotiable
- Paystack TEST keys only (sk_test_/pk_test_). Never live keys or real cards.
- No secrets in git. Keys live in .env.local and Vercel env vars.
- Real content only: Naira prices, Benin City places (Ugbowo, Ring Road, GRA, Uselu). No lorem ipsum, no fake reviews.
- Role checks happen on the server (middleware + RLS + route handlers). Never trust a cookie, a hidden field or a client-sent price.
- Prices are calculated server-side from the `services` table; the UI calculator is only a preview.
- Paystack webhook (verify x-paystack-signature) is the only thing that marks a job Paid.

## Stack
Next.js 15 App Router + TypeScript, Tailwind 3, Supabase (Postgres, Auth, Storage), Resend, Paystack, Vercel.

## Phases (validate each before the next)
1. Scaffold, schema, middleware  2. Auth + login + home calculator  3. Booking + Paystack + webhook
4. Cleaner portal + proof photo  5. Admin portal  6. Emails, SEO, a11y, deploy, access-test screenshots
