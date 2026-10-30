# One bug explained: "Invalid Server Actions request"

**What I saw:** Logging in on GitHub Codespaces showed the error `Error: Invalid Server Actions request` and the login did nothing, even with the right password.

**How I found the cause:** The error appeared in the browser console, not as a wrong-password message, so the request never reached my login code. In the terminal, Next.js reported that the `x-forwarded-host` and `origin` headers did not match. Codespaces serves the app through a forwarded address (`*.app.github.dev`), and Next.js blocks Server Actions (used for login and signup) when those two values differ, as a protection against forged requests.

**The fix:** In `next.config.ts` I added the forwarded domains to the allowed list:
`experimental: { serverActions: { allowedOrigins: ["localhost:3000", "*.app.github.dev"] } }`
After restarting the dev server, login worked.

**What I learned:** The security check was working as designed. A real error message in the terminal and console pointed to the cause faster than guessing at the password.
