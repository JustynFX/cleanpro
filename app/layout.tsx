import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CleanPro | Home & Office Cleaning in Benin City",
  description:
    "Get an instant price for home and office cleaning in Benin City, Edo State. Book online, pay securely and see photo proof when the job is done.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
