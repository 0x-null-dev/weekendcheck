"use client";

import { useRef, useState, type FormEvent } from "react";
import { contactErrors, contactTopics, type ContactField } from "@/lib/contact-topics";

type Errors = Partial<Record<ContactField, string>>;
const fieldOrder: ContactField[] = ["name", "email", "topic", "link", "message"];

export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [problem, setProblem] = useState("");
  const summary = useRef<HTMLDivElement>(null);

  function values(form: HTMLFormElement) { return Object.fromEntries(new FormData(form)) as Record<string, string>; }
  // Check one field when the visitor leaves it, and clear its error as soon as it is valid.
  function check(form: HTMLFormElement, field: ContactField) {
    const message = contactErrors(values(form)).fields[field];
    setErrors(current => ({ ...current, [field]: message }));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const { fields } = contactErrors(values(form));
    setErrors(fields); setProblem("");
    if (Object.keys(fields).length) { requestAnimationFrame(() => summary.current?.focus()); return; }
    setStatus("sending");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values(form)) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setErrors(result.fields || {}); setProblem(result.error || "Your message could not be sent. Please try again."); setStatus("idle"); requestAnimationFrame(() => summary.current?.focus()); return; }
      setStatus("sent");
    } catch {
      setProblem("You seem to be offline. Check your connection and try again."); setStatus("idle");
    }
  }

  if (status === "sent") return <div className="form-done" role="status"><span className="label coin">Message sent</span><h2>Thanks, I&apos;ve got it.</h2><p>I read every message and reply by email, usually within a few days.</p></div>;

  const errorList = fieldOrder.filter(field => errors[field]);
  const field = (name: ContactField) => ({ id: `contact-${name}`, name, "aria-invalid": errors[name] ? true : undefined, "aria-describedby": errors[name] ? `contact-${name}-error` : undefined, onBlur: (e: { currentTarget: HTMLElement }) => check(e.currentTarget.closest("form")!, name) });
  const error = (name: ContactField) => errors[name] && <span className="field-error" id={`contact-${name}-error`}>{errors[name]}</span>;

  return <form className="contact-form" onSubmit={submit} noValidate>
    {(errorList.length > 0 || problem) && <div className="form-alert" role="alert" tabIndex={-1} ref={summary}>
      <b>{problem || "Please fix these before sending:"}</b>
      {errorList.length > 0 && <ul>{errorList.map(name => <li key={name}><a href={`#contact-${name}`}>{errors[name]}</a></li>)}</ul>}
    </div>}
    <div className="field-pair">
      <div className="field"><label htmlFor="contact-name">Your name</label><input {...field("name")} autoComplete="name" maxLength={120} />{error("name")}</div>
      <div className="field"><label htmlFor="contact-email">Email</label><input {...field("email")} type="email" autoComplete="email" maxLength={254} />{error("email")}</div>
    </div>
    <div className="field"><label htmlFor="contact-topic">What is it about?</label><select {...field("topic")} defaultValue="project">{Object.entries(contactTopics).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{error("topic")}</div>
    <div className="field"><label htmlFor="contact-link">Link to your project <span className="optional">optional</span></label><input {...field("link")} type="url" inputMode="url" placeholder="https://" maxLength={2048} />{error("link")}</div>
    <div className="field"><label htmlFor="contact-message">Message</label><textarea {...field("message")} rows={6} maxLength={5000} placeholder="What does it do, who is it for, and is there anything you want me to test?" />{error("message")}</div>
    {/* Hidden from people; bots that fill it are ignored. */}
    <div className="trap" aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off" /></div>
    <div className="form-foot">
      <button className="btn" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send message"}</button>
      <p>I only use your details to reply. <a href="/privacy">Privacy</a></p>
    </div>
  </form>;
}
