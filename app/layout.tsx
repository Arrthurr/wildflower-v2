import type { Metadata } from "next";
import { Hedvig_Letters_Serif, Rethink_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { AppShell } from "@/components/layout/app-shell";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const rethinkSans = Rethink_Sans({
  variable: "--font-rethink",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const hedvigSerif = Hedvig_Letters_Serif({
  variable: "--font-hedvig",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Wildflower Media",
    template: "%s · Wildflower Media",
  },
  description:
    "Podcasts and merch from Wildflower Media — The Music Snobs and Snobs On Film.",
  openGraph: {
    type: "website",
    siteName: "Wildflower Media",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${rethinkSans.variable} ${hedvigSerif.variable} h-full`}>
      <body className="h-full">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
