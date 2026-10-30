import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "CleanPro | Home & Office Cleaning in Benin City",
  description:
    "Get an instant price for home and office cleaning in Benin City, Edo State. Book online, pay securely and see photo proof when the job is done.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-gray-900 antialiased">
        <SiteHeader />
        <div className="flex-1">{children}</div>
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
