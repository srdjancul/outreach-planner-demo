import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

// Hanken Grotesk — the free, Google-Fonts successor of HK Grotesk
// (the finance design's typeface).
const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.name,
  description: SITE.description,
  // Link previews (LinkedIn, Slack, X); the image is app/opengraph-image.png.
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE.name,
    title: `${SITE.name}: outreach CRM + daily planner`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name}: outreach CRM + daily planner`,
    description: SITE.description,
  },
};

export const viewport: Viewport = {
  // --black-900; meta tags need a literal value.
  themeColor: "#0c0d0d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${hanken.variable} h-full`}>
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla)
          inject attributes into <body> and trip dev hydration warnings. */}
      <body className="min-h-full" suppressHydrationWarning>
        <div aria-hidden className="app-beams" />
        {children}
      </body>
    </html>
  );
}
