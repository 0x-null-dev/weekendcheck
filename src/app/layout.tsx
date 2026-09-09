import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "WeekendCheck — Independent apps, examined weekly", template: "%s · WeekendCheck" },
  description: "A weekly editorial review desk for small independent apps found on X.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
