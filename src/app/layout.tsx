import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: {
    default: "WeekendCheck — Real feedback on early projects",
    template: "%s | WeekendCheck",
  },
  description:
    "Submit your project, get upvoted by the community, and receive an honest review every weekend. No sugar coating. Built by 0xNull.",
  metadataBase: new URL("https://weekendcheck.com"),
  keywords: [
    "project reviews",
    "indie hacker",
    "side project feedback",
    "micro saas",
    "weekend check",
    "product review",
    "startup feedback",
  ],
  authors: [{ name: "0xNull", url: "https://x.com/0x_null_dev" }],
  creator: "0xNull",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "WeekendCheck",
    title: "WeekendCheck — Real feedback on early projects",
    description:
      "Submit your project, get upvoted by the community, and receive an honest review every weekend. No sugar coating.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "WeekendCheck — Real feedback on early projects" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "WeekendCheck — Real feedback on early projects",
    description:
      "Submit your project, get upvoted by the community, and receive an honest review every weekend. No sugar coating.",
    creator: "@0x_null_dev",
    images: ["/og.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
