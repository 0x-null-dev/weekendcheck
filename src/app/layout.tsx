import type { Metadata } from "next";
import "./globals.css";
import { siteDescription, siteName, siteUrl, xHandle } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "0xAlexCheck", template: "%s · 0xAlex Check" },
  description: siteDescription,
  openGraph: { type: "website", siteName, title: siteName, description: siteDescription, locale: "en_US" },
  twitter: { card: "summary_large_image", site: `@${xHandle}`, creator: `@${xHandle}`, title: siteName, description: siteDescription },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
