import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/mark";
import styles from "./research.module.css";

export const metadata: Metadata = {
  title: "0xAlex Research",
  description: "A private local tool for exploring product markets and keyword search demand, operated by Alex.",
  alternates: { canonical: "https://check.0xalex.com/research" },
};

export default function ResearchPage() {
  return <><SiteHeader /><main className={styles.page}>
    <Link href="/">← 0xAlex Check</Link>
    <p className={styles.label}>PRIVATE RESEARCH TOOL</p>
    <h1>0xAlex Research</h1>
    <p>I&apos;m Alex, the operator of 0xAlex Check. Alongside trying and reviewing products, I maintain a private tool on my own computer to explore product markets and search demand.</p>
    <h2>What the tool does</h2>
    <p>The planned Google Ads API integration retrieves keyword suggestions and historical search metrics for selected countries and languages. These aggregate estimates help me compare search demand and assess potential search advertising opportunities for products I am researching.</p>
    <p>The integration is currently being configured. This page describes its purpose; it is not a public application or a signup page.</p>
    <h2>Google account access</h2>
    <p>Only my authorized Google Ads account is intended to connect. Google authorization is used to make the research requests. The workflow does not create or modify campaigns, publish advertisements, or access other people&apos;s Google accounts.</p>
    <h2>Where it runs</h2>
    <p>The research tool runs locally. This website hosts its public information and privacy policy. Keyword estimates are research evidence, not proof of customer demand or willingness to pay.</p>
    <p><Link href="/research/privacy">Read the research privacy policy</Link></p>
    <p>Questions: <a href="mailto:0xnull.dev@gmail.com">0xnull.dev@gmail.com</a>.</p>
  </main><SiteFooter /></>;
}
