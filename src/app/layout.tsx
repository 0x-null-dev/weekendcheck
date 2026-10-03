import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "0xAlex Check — Indie apps and AI projects", template: "%s · 0xAlex Check" },
  description: "Alex explores indie apps and AI projects, then shares practical feedback when there is something useful to say.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
