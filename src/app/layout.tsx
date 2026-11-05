import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/utils";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Poppins({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "SupremeInsight | Insight for the Christian Marketplace",
    template: "%s | SupremeInsight",
  },
  description:
    "An independent publication exploring faith, business, finance, media, education, technology, leadership and culture from a Christian marketplace perspective.",
  openGraph: { siteName: "SupremeInsight", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
