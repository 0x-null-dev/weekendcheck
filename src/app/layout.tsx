import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "0xAlex Tries — Free feedback for indie apps", template: "%s · 0xAlex Tries" },
  description: "Alex tries indie apps and gives free, practical feedback to the people building them.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
