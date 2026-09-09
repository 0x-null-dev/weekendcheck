"use client";
import { useState } from "react";
import Link from "next/link";
import { Mark } from "@/components/mark";
import styles from "./login.module.css";
export function LoginForm() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <main className={styles.page}><div className={styles.card}><Mark /><h1>Back to your desk.</h1><p>Sign in to manage projects, reviews, and posts.</p><form onSubmit={async event => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      // A full navigation discards cached pages from the previous auth state.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/admin");
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to sign in."); setBusy(false); }
  }}><label htmlFor="admin-password">Password</label><input id="admin-password" type="password" autoComplete="current-password" autoFocus required maxLength={256} value={password} onChange={e => setPassword(e.target.value)} disabled={busy} />{error && <p className={styles.error} role="alert">{error}</p>}<button disabled={busy}>{busy ? "Signing in…" : "Sign in →"}</button></form><Link href="/">← Back to WeekendCheck</Link></div></main>;
}
