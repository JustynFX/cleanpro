# CleanPro: 5-Minute Demo Script

Before you start: log in as admin, customer and cleaner in three browser windows (or private windows). Have Supabase's `payments` table open in another tab.

| Time | Do this | Maps to checklist |
| :-- | :-- | :-- |
| 0:00 | "CleanPro is for a cleaning company in Benin City. Jobs were assigned by phone, so cleaners missed addresses and nobody could prove a job was done." | 1 |
| 0:30 | Home page: use the calculator (Standard Deep Clean, 2 bedrooms, 1 bathroom). Click Book this clean. | 2 |
| 1:00 | Customer: fill the booking form and pay with the Paystack test card. | 2, 5 |
| 1:45 | Booking page shows **Paid**. Show the new row in Supabase `payments` and `jobs`. Show the confirmation email. | 3, 5, 6 |
| 2:30 | Admin: Dispatch, assign the job to a cleaner. Mention revenue on Overview. | 2 |
| 3:00 | Cleaner: open the job, Start, take a photo, Submit. Show the completion email arriving. | 2, 6 |
| 3:45 | Customer page now shows **Completed** and the photo. | 2 |
| 4:00 | Refused access: customer opens /admin/dispatch and gets the red banner. Logged-out visit goes to login. | 4 |
| 4:30 | GitHub commit history and the live link. Explain the Server Actions bug (docs/BUG_REPORT.md). | 7, 8 |
