import { Atkinson_Hyperlegible, Bricolage_Grotesque, Silkscreen } from "next/font/google";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import "./site.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display", display: "swap" });
const body = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-body", display: "swap" });
const pixel = Silkscreen({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-pixel", display: "swap" });

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <div className={`site ${display.variable} ${body.variable} ${pixel.variable}`}>
    <a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader />
    <main id="main">{children}</main>
    <SiteFooter />
  </div>;
}
