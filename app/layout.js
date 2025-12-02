import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BookYourSpa - Find & Book Best Spa Services",
  description:
    "Discover and book the best spa and wellness centers across Ahmedabad, Gandhinagar, and other cities.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <SpeedInsights />
        <Analytics />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
