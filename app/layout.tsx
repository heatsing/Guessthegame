import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import {
  googleVerification,
  homeDescription,
  homeTitle,
} from "@/lib/seo";
import { site } from "@/lib/site";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: homeTitle,
    template: `%s — ${site.name}`,
  },
  description: homeDescription,
  applicationName: site.name,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    siteName: site.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
  },
  verification: googleVerification(),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fcfcfb",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
