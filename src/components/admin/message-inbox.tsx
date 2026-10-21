"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { contactTopics, type ContactMessage } from "@/lib/contact-topics";

export function MessageInbox({ messages }: { messages: ContactMessage[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  async function update(id: string, status: "new" | "done" | "delete") {
    setBusy(id); setError("");
    try {
      const response = await fetch("/api/admin/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
      if (!response.ok) throw new Error((await response.json()).error || "Unable to update the message.");
      router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to update the message."); }
    finally { setBusy(""); }
  }
  const open = messages.filter(m => m.status === "new").length;
  return <>
    <div className="desk-heading"><div><p className="eyebrow">CONTACT FORM</p><h1>Messages</h1><p>{open ? `${open} waiting for a reply.` : "Nothing waiting."} Reply from your own email; mark a message done when it is handled.</p></div></div>
    {error && <p className="desk-error" role="alert">{error}</p>}
    {!messages.length && <section className="desk-panel desk-empty"><p>No messages yet. They appear here when someone uses the contact page.</p></section>}
    <div className="desk-messages">{messages.map(m => <article key={m.id} className={`desk-panel desk-message ${m.status}`}>
      <header><div><b>{m.name}</b> <a href={`mailto:${m.email}`}>{m.email}</a></div><span className={`desk-pill ${m.status === "new" ? "green" : ""}`}>{m.status === "new" ? "New" : "Done"}</span></header>
      <small>{contactTopics[m.topic]} · {new Date(m.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}{m.link && <> · <a href={m.link} target="_blank" rel="noreferrer">{m.link} ↗</a></>}</small>
      <p>{m.message}</p>
      <div className="desk-row-actions desk-inline">
        <button className="desk-button" disabled={busy === m.id} onClick={() => void update(m.id, m.status === "new" ? "done" : "new")}>{m.status === "new" ? "Mark done" : "Mark as new"}</button>
        <button className="desk-link-button danger" disabled={busy === m.id} onClick={() => { if (window.confirm("Delete this message?")) void update(m.id, "delete"); }}>Delete</button>
      </div>
    </article>)}</div>
  </>;
}
