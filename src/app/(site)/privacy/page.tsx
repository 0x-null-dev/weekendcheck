import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What 0xAlex Check collects through the contact form and how it is used.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <div className="wrap page prose">
    <p className="label">Privacy · updated October 21, 2026</p>
    <h1>Privacy</h1>
    <p>0xAlex Check is run by Alex, an individual in Europe. This page explains what the site collects and why.</p>
    <h2>Contact form</h2>
    <p>When you send a message, I store your name, email address, the topic you chose, the link you added and your message. I use them only to read and answer your message and to consider your project for a review. I don&apos;t sell them, share them or add you to a mailing list.</p>
    <p>Messages are stored in a database hosted by Supabase in the EU (Frankfurt). The site runs on Vercel. To stop spam, your IP address is turned into a one-way code that is used only to limit how many messages can be sent; the address itself is not stored.</p>
    <h2>Visiting the site</h2>
    <p>The site doesn&apos;t use analytics, advertising or tracking cookies. The hosting provider keeps standard server logs for security and reliability.</p>
    <h2>Your choices</h2>
    <p>You can ask me to see, correct or delete your message at any time by emailing <a href="mailto:0xnull.dev@gmail.com">0xnull.dev@gmail.com</a>. I delete messages that are no longer needed.</p>
    <p>The separate <Link href="/research/privacy">research tool privacy policy</Link> covers my private Google Ads research tool.</p>
  </div>;
}
