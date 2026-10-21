import type { Metadata } from "next";
import { ContactForm } from "@/components/site/contact-form";
import { xHandle } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send Alex your indie app or AI project to try, or get in touch about a review.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <div className="wrap page">
    <header className="page-head"><p className="label">Contact</p><h1>Send me your project.</h1><p className="lede">Tell me what you built and what you want feedback on. You can also write about a review or anything else.</p></header>
    <div className="contact-layout">
      <ContactForm />
      <aside className="contact-aside">
        <h2 className="label coin">What happens next</h2>
        <ol>
          <li>I read every message myself.</li>
          <li>If your project fits, I add it to an upcoming week and try it.</li>
          <li>I reply by email, usually within a few days.</li>
        </ol>
        <p>I can&apos;t review everything, and sending a project doesn&apos;t guarantee a review.</p>
        <p>Prefer X? Message <a className="text-link" href={`https://x.com/${xHandle}`} target="_blank" rel="noreferrer">@{xHandle} ↗</a></p>
      </aside>
    </div>
  </div>;
}
