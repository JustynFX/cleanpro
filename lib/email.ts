// SERVER ONLY. Transactional emails via Resend. Never throws: a failed email must not break a booking.
import { Resend } from "resend";
import { formatNaira } from "@/lib/pricing";

const FROM = process.env.EMAIL_FROM ?? "CleanPro <onboarding@resend.dev>";

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.includes("placeholder") || key.startsWith("re_xxx")) return null;
  return new Resend(key);
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function send(to: string, subject: string, html: string) {
  const resend = client();
  if (!resend) {
    console.warn(`[EMAIL] skipped (no valid RESEND_API_KEY): ${subject}`);
    return;
  }
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) console.error("[EMAIL] failed:", error);
    else console.log(`[EMAIL] sent: ${subject} -> ${to}`);
  } catch (e) {
    console.error("[EMAIL] error:", e);
  }
}

export async function sendBookingConfirmationEmail(
  to: string,
  customerName: string,
  d: { serviceName: string; dateLabel: string; timeSlot: string; address: string; amount: number }
) {
  await send(
    to,
    "Booking confirmed | CleanPro Benin City",
    `<h2>Hello ${esc(customerName)},</h2>
     <p>Thank you for choosing <strong>CleanPro</strong>. Your payment was received and your clean is booked.</p>
     <ul>
       <li><strong>Service:</strong> ${esc(d.serviceName)}</li>
       <li><strong>Date:</strong> ${esc(d.dateLabel)}</li>
       <li><strong>Time:</strong> ${esc(d.timeSlot)}</li>
       <li><strong>Address:</strong> ${esc(d.address)}</li>
       <li><strong>Total paid:</strong> ${esc(formatNaira(d.amount))}</li>
     </ul>
     <p>We will assign a cleaner shortly. You will get another email with a photo when the job is done.</p>
     <p>The CleanPro Team</p>`
  );
}

export async function sendJobCompletedEmail(to: string, customerName: string, photoUrl: string) {
  const safeUrl = photoUrl.startsWith("https://") ? esc(photoUrl) : "";
  await send(
    to,
    "Your cleaning job is complete | CleanPro",
    `<h2>Hello ${esc(customerName)},</h2>
     <p>Your cleaner has finished the job. Here is the completion photo:</p>
     ${safeUrl ? `<p><img src="${safeUrl}" alt="Photo of the finished cleaning job" style="max-width:100%;border-radius:8px"/></p>` : ""}
     <p>Thank you for trusting CleanPro.</p>`
  );
}
