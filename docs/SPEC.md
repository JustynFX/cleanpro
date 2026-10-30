# CleanPro: One-Page Spec (P01)

**App:** CleanPro (#22, Services) · **Client:** a home and office cleaning company in Benin City, Edo State

**Problem:** Jobs are assigned by phone call, so cleaners miss addresses, prices are inconsistent, and customers have no proof the job was done.

**Solution:** A web app that gives an instant price from property size, takes payment online, sends each cleaner their exact address, and requires a "job done" photo to close every job.

| User | What they do |
| :-- | :-- |
| Customer | Gets an instant price, books a date and time slot, pays online (test), tracks the booking, sees the job-done photo |
| Cleaner | Sees assigned jobs by day, opens the address in Google Maps, starts the job, uploads the completion photo |
| Admin | Assigns paid jobs to cleaners, edits service prices, tracks revenue and completed jobs |

**Special feature:** Instant price = service base price + bedrooms x bedroom rate + bathrooms x bathroom rate (Naira).

**Why the client pays:** Fewer missed jobs, fewer phone calls, upfront online payment, and photo proof that reduces disputes. Business model: monthly subscription for the cleaning company.

**Data saved:** services, cleaners, jobs, payments (plus profiles for roles).

**Automations:** Resend email on successful payment (booking confirmation) and when the job-done photo is uploaded (completion email with photo).

**Payments:** Paystack in test mode only. A booking becomes Paid only after the server confirms the payment with Paystack (webhook and return-page check).

**Out of scope for this version:** customer phone numbers, refunds, reviews, recurring bookings.
