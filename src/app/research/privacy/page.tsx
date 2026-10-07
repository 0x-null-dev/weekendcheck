import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/mark";
import styles from "../research.module.css";

export const metadata: Metadata = {
  title: "Research privacy policy",
  description: "How 0xAlex Research handles Google authorization and keyword research data.",
  alternates: { canonical: "https://check.0xalex.com/research/privacy" },
};

export default function ResearchPrivacyPage() {
  return <><SiteHeader /><main className={styles.page}>
    <Link href="/research">← 0xAlex Research</Link>
    <h1>Research privacy policy</h1>
    <p className={styles.label}>Effective October 7, 2026</p>
    <p>This policy covers 0xAlex Research, a private local research tool operated by Alex. The Google Ads integration is being configured. The handling practices below apply when it is enabled.</p>
    <h2>Data accessed and purpose</h2>
    <p>The tool uses Google OAuth authorization and a Google Ads customer ID to request keyword suggestions and aggregate historical metrics, such as monthly search estimates, advertising competition, and bid ranges. Requests include research keywords and selected geographic and language settings.</p>
    <p>These results support private market research and evaluation of potential search advertising opportunities. They do not identify individual searchers. The workflow does not request Gmail messages, contacts, individual search histories, or individual advertising customer records.</p>
    <h2>Authorization and storage</h2>
    <p>Google handles sign-in; the tool does not receive or store your Google password. OAuth credentials and tokens used to access the authorized account are kept in local configuration files, outside the public website and source repository. Saved keyword responses and research notes are kept in local research files or a local database.</p>
    <p>Although the Google Ads OAuth permission can allow account changes, this research workflow only reads data and does not create or modify advertising campaigns.</p>
    <h2>Sharing and AI analysis</h2>
    <p>Credentials, OAuth tokens, and Google account identifiers are not published or supplied to AI models. Google receives the requests necessary to provide its API service. Aggregate keyword results and research notes may be analyzed using local or third-party AI tools, with account identifiers and credentials excluded. Where third-party tools are used, their data handling terms also apply.</p>
    <p>Google user data is not sold, used for advertising targeting, or used to train or improve general-purpose AI models. The application&apos;s use and transfer of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy">Google API Services User Data Policy</a>, including its Limited Use requirements.</p>
    <h2>Retention and deletion</h2>
    <p>Authorization tokens are retained locally while the integration is in use. Saved aggregate research results are retained until the operator deletes them. Disconnecting the account stops future access but does not automatically erase saved results.</p>
    <p>Access can be revoked through <a href="https://myaccount.google.com/connections">Google Account connections</a>. Local credentials, tokens, and saved research data can be deleted by the operator. For questions or a deletion request, contact <a href="mailto:0xnull.dev@gmail.com">0xnull.dev@gmail.com</a>.</p>
    <h2>Public information pages</h2>
    <p>These pages do not ask visitors to connect a Google account or submit research queries. The website hosting provider may process normal request information, such as IP addresses and browser details, to serve and secure the pages.</p>
    <h2>Changes</h2>
    <p>This page will be updated if the integration&apos;s purpose or data handling changes. The effective date above will reflect those updates.</p>
  </main><SiteFooter /></>;
}
