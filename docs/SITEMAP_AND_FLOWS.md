# CleanPro: Sitemap, User Flows and Wireframes (P02 to P04)

## Sitemap
```text
Public
  /               Home: hero, instant price calculator, how it works, areas served
  /services       Services and Naira prices
  /login          Log in or create a customer account
Customer (role: customer)
  /dashboard/book          Booking form -> Paystack checkout
  /dashboard/bookings      My bookings
  /dashboard/bookings/[id] Booking detail, Pay now, job-done photo
Cleaner (role: cleaner)
  /cleaner/today           Overdue / Today / Upcoming jobs
  /cleaner/jobs/[id]       Address, Start job, upload photo
Admin (role: admin)
  /admin/overview          Revenue, completed jobs, status counts
  /admin/dispatch          Assign cleaners to paid jobs
  /admin/services          Edit base prices and room rates
API
  /api/paystack/webhook    Paystack payment confirmation (signature checked)
  /api/upload-proof        Cleaner photo upload (cleaner only)
```

## Main flows
**Customer:** Home -> calculator -> Book this clean -> (log in or sign up) -> booking form -> Paystack test payment -> booking page shows Paid -> confirmation email -> later sees Completed + photo.

**Admin:** Log in -> Overview shows "Need a cleaner" -> Dispatch -> choose cleaner -> Assign.

**Cleaner:** Log in -> Today's jobs -> open job -> Start job -> take photo -> Submit -> job Completed -> customer emailed.

**Refused access:** Logged out on a protected page -> /login?refused_reason=unauthenticated. Wrong role -> own home page with ?error=refused_access_unauthorized_role and a red banner.

## Wireframes (text)
```text
HOME (mobile)                      BOOKING FORM
+--------------------------+       +--------------------------+
| CleanPro     Services  Log in|   | Book a clean             |
|--------------------------|       | [Cleaning type v]        |
| A spotless home or office|       | [Bedrooms] [Bathrooms]   |
| Your price in seconds.   |       | [Address ............]   |
| [Calculate my price]     |       | [Landmark]               |
| +----------------------+ |       | [Date]  [Time slot v]    |
| | Instant price calc   | |       | [Notes]                  |
| | [service v]          | |       | Estimated total  N14,000 |
| | Bedrooms  [-] 1 [+]  | |       | [Continue to payment]    |
| | Bathrooms [-] 1 [+]  | |       +--------------------------+
| | Total  N14,000       | |
| | [Book this clean]    | |       CLEANER JOB
| +----------------------+ |       +--------------------------+
| How it works (4 steps)   |       | Standard Deep Clean [Assigned]|
| Where we clean           |       | Date / Time / Address    |
+--------------------------+       | [Open in Google Maps]    |
                                   | [Start job]              |
                                   | -> [Take photo] [Submit] |
                                   +--------------------------+
```
