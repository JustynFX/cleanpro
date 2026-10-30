import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

const base = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: "CleanPro | Home & Office Cleaning in Benin City",
  description:
    "Get an instant price for home and office cleaning in Benin City, Edo State. Book online, pay securely and see photo proof when the job is done.",
  openGraph: {
    title: "CleanPro | Home & Office Cleaning in Benin City",
    description: "Instant cleaning prices, online booking and photo proof of every finished job in Benin City.",
    type: "website",
    locale: "en_NG",
    siteName: "CleanPro",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-gray-900 antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-brand-700 focus:shadow">
          Skip to main content
        </a>
        <SiteHeader />
        <div id="main" tabIndex={-1} className="flex-1 outline-none">{children}</div>
        <footer className="mt-16 border-t border-gray-100 bg-gray-50">
          <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-gray-600">
            <p>CleanPro · Home and office cleaning in Benin City, Edo State.</p>
            <p className="mt-1">Payments on this site run in Paystack test mode. No real money is charged.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
