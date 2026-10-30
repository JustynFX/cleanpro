# CleanPro

Online booking, dispatch and payment for a home and office cleaning company in **Benin City, Edo State**.
Tech4Youth Edo, Module 06 individual project (#22).

## Live links
- **Live site:** https://cleanpro-edotech.vercel.app/  
- **GitHub:** https://github.com/JustynFX/cleanpro  

## The problem
Cleaning jobs were assigned by phone call, so cleaners missed addresses, prices were inconsistent, and customers had no proof that the job was done.

## What it does
- **Instant price calculator** (special feature): service base price + bedrooms + bathrooms, in Naira
- Customers book a date and time slot, pay online (Paystack **test mode**), and see their bookings
- Cleaners see their assigned jobs, open the address in Google Maps, start the job, and **upload a job-done photo** to close it
- Admins assign paid jobs to cleaners, edit prices, and track revenue and completed jobs
- Emails (Resend): booking confirmation after payment, and a completion email with the photo

## Users
| Role | Home page after login | Can do |
| :-- | :-- | :-- |
| Customer | /dashboard/bookings | Book, pay, track, view job-done photo |
| Cleaner | /cleaner/today | See assigned jobs, start, upload photo |
| Admin | /admin/overview | Dispatch, pricing, revenue |

## Tech stack
Next.js 15 (App Router) and TypeScript · Tailwind CSS · Supabase (Postgres, Auth, Storage) · Paystack (test mode) · Resend · Vercel

## How to run it
1. `npm install`
2. Create a Supabase project and run these files in the SQL Editor, in order:
   `supabase/migrations/0001_schema.sql`, `0002_storage.sql`, `0003_admin_stats.sql`
3. Copy `.env.example` to `.env.local` and fill in the values (Paystack **test** keys only)
4. `npm run dev`, then open http://localhost:3000
5. Create users in Supabase (Authentication > Users, tick Auto Confirm), then promote staff with the SQL at the bottom of `0001_schema.sql`

## Security
- Route protection in `middleware.ts` reads the role from the database for the verified user (never from a cookie)
- Database Row Level Security: customers see only their own jobs and payments, cleaners only jobs assigned to them
- Prices are calculated on the server from the database; a booking becomes **Paid** only after the server confirms the payment with Paystack
- Paystack webhook signature is verified; the app refuses any Paystack key that is not `sk_test_`
- Photo uploads: cleaner-only, must be their assigned job, file type checked from the file itself
- No secrets in the repo; keys live in `.env.local` and Vercel environment variables

## Refused-access proof
Screenshots are in `docs/screenshots/` (see `docs/TESTING.md` for the full table and file names).

| Who | Tries | Result | Screenshot |
| :-- | :-- | :-- | :-- |
| Logged out | /admin/overview, /cleaner/today, /dashboard/bookings | Redirect to /login?refused_reason=unauthenticated | 01 to 03 |
| Customer | /admin/dispatch, /admin/services, /cleaner/today | Sent back with refused_access_unauthorized_role banner | 04 to 06 |
| Cleaner | /dashboard/book, /admin/overview | Sent back with banner | 07, 08 |
| Admin | /cleaner/today, /dashboard/bookings | Sent back with banner | 09, 10 |
| Another customer | Someone else's booking link | 404 | 11 |
| Anyone | Webhook with fake signature / upload API logged out | 401 / 403 | 00 (script output) |

## Test accounts (demo project only)
| Role | Email | Password |
| :-- | :-- | :-- |
| Admin | admin@cleanpro.ng | AdminTest123! |
| Cleaner | cleaner@cleanpro.ng | CleanerTest123! |
| Customer | customer@cleanpro.ng | CustomerTest123! |

These accounts exist only in the demo database and protect nothing real.

## Test payment
Paystack is in **test mode**: no real money moves. Use a test card from the Paystack docs (for example 4084 0840 8408 4081, any future expiry, CVV 408). Never use a real card.

## Project documents
[Spec](docs/SPEC.md) · [Sitemap, flows and wireframes](docs/SITEMAP_AND_FLOWS.md) · [Style guide](docs/STYLE_GUIDE.md) · [Testing](docs/TESTING.md) · [Bug explained](docs/BUG_REPORT.md) · [Demo script](docs/DEMO_SCRIPT.md)
