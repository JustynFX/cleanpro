# CleanPro: Testing and Evidence

Test accounts are listed in the README. Save screenshots into `docs/screenshots/` using the file names below.

## A. Automated refused-access checks (logged out)
Run in a terminal: `node scripts/access-tests.mjs http://localhost:3000` (and again with the live link).
Screenshot the output as `docs/screenshots/00-script-results.png`.

## B. Manual refused-access tests (screenshot address bar + red banner)
| # | Logged in as | Opens | Expected | Screenshot |
| :-- | :-- | :-- | :-- | :-- |
| 1 | nobody | /admin/overview | Redirect to /login?refused_reason=unauthenticated | 01-logged-out-admin.png |
| 2 | nobody | /cleaner/today | Redirect to /login?refused_reason=unauthenticated | 02-logged-out-cleaner.png |
| 3 | nobody | /dashboard/bookings | Redirect to /login?refused_reason=unauthenticated | 03-logged-out-dashboard.png |
| 4 | customer | /admin/dispatch | Back to /dashboard/bookings?error=refused_access_unauthorized_role + banner | 04-customer-admin.png |
| 5 | customer | /admin/services | Same as above | 05-customer-admin-services.png |
| 6 | customer | /cleaner/today | Same as above | 06-customer-cleaner.png |
| 7 | cleaner | /dashboard/book | Back to /cleaner/today?error=... + banner | 07-cleaner-dashboard.png |
| 8 | cleaner | /admin/overview | Same as above | 08-cleaner-admin.png |
| 9 | admin | /cleaner/today | Back to /admin/overview?error=... + banner | 09-admin-cleaner.png |
| 10 | admin | /dashboard/bookings | Same as above | 10-admin-dashboard.png |
| 11 | a different customer | another customer's /dashboard/bookings/[id] | 404 page | 11-other-customer-booking.png |

## C. Payment and automation evidence
| Check | Screenshot |
| :-- | :-- |
| Paystack test checkout page | 12-paystack-checkout.png |
| Booking page showing Paid + green banner | 13-booking-paid.png |
| Supabase payments table (Success) and jobs table (Paid) | 14-database-paid.png |
| Booking confirmation email in inbox | 15-email-booking.png |
| Job-done email with photo | 16-email-job-done.png |
| Terminal showing [WEBHOOK] charge.success (if webhook set up) | 17-webhook-log.png |

## D. Mobile and accessibility (open the live link on a phone)
- [ ] Every page works at phone width, with no sideways scrolling
- [ ] All buttons and inputs are easy to tap (44 px or taller)
- [ ] Text is readable outdoors (high contrast)
- [ ] Press Tab on a laptop: you can reach every button and field, and the focus outline is visible
- [ ] "Skip to main content" appears when you press Tab on the home page
- [ ] Every form field has a visible label; errors are written in plain words
- [ ] Photos have descriptive alt text
- [ ] Home page loads in a few seconds on mobile data

## E. SEO
- [ ] Each public page has its own title and description (home, services, login)
- [ ] /robots.txt blocks /admin, /cleaner, /dashboard and /api
- [ ] /sitemap.xml lists the public pages
- [ ] Tab icon (favicon) shows
