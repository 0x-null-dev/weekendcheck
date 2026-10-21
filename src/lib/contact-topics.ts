// Browser-safe contact form pieces: topics, types and validation shared by the form and the server.
export const contactTopics = { project: "Review my project", feedback: "Feedback on a review", other: "Something else" } as const;
export type ContactTopic = keyof typeof contactTopics;
export type ContactInput = { name: string; email: string; topic: ContactTopic; link: string; message: string };
export type ContactMessage = ContactInput & { id: string; createdAt: string; status: "new" | "done" };
export type ContactField = keyof ContactInput;

const clean = (value: unknown) => typeof value === "string" ? value.replace(/\r\n/g, "\n").trim() : "";

// Used by the form before sending and by the server before saving, so both show the same messages.
export function contactErrors(raw: Record<string, unknown>) {
  const input = { name: clean(raw.name), email: clean(raw.email), topic: clean(raw.topic), link: clean(raw.link), message: clean(raw.message) };
  const fields: Partial<Record<ContactField, string>> = {};
  if (!input.name) fields.name = "Enter your name.";
  else if (input.name.length > 120) fields.name = "Use 120 characters or fewer.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) || input.email.length > 254) fields.email = "Enter an email address like you@example.com.";
  if (!(input.topic in contactTopics)) fields.topic = "Choose what your message is about.";
  if (input.link) {
    let url: URL | undefined;
    try { url = new URL(/^https?:\/\//i.test(input.link) ? input.link : `https://${input.link}`); } catch { /* reported below */ }
    if (!url || !url.hostname.includes(".") || input.link.length > 2048) fields.link = "Enter a full link, like https://yourproject.com.";
    else input.link = url.toString();
  }
  if (!input.message) fields.message = "Write a short message.";
  else if (input.message.length > 5000) fields.message = "Keep it under 5,000 characters.";
  return { input: input as ContactInput, fields };
}
