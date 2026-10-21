import { createHash } from "node:crypto";
import { database } from "./database";
import { contactErrors, type ContactField, type ContactMessage, type ContactTopic } from "./contact-topics";

export class ContactInvalid extends Error {
  constructor(public fields: Partial<Record<ContactField, string>>) { super("Check the highlighted fields."); }
}
export class ContactRateLimited extends Error {}

async function consume(id: string, limit: number, window: string) {
  const { rows } = await database().query<{ attempts: number }>(`INSERT INTO weekendcheck.login_limits(id, attempts, resets_at) VALUES ($1, 1, now() + $2::interval)
    ON CONFLICT(id) DO UPDATE SET attempts = CASE WHEN weekendcheck.login_limits.resets_at <= now() THEN 1 ELSE weekendcheck.login_limits.attempts + 1 END,
    resets_at = CASE WHEN weekendcheck.login_limits.resets_at <= now() THEN now() + $2::interval ELSE weekendcheck.login_limits.resets_at END RETURNING attempts`, [id, window]);
  return rows[0].attempts <= limit;
}

// Five messages per sender per hour, and a site-wide cap so a flood cannot fill the inbox.
export async function saveContact(raw: Record<string, unknown>, client: string) {
  const { input, fields } = contactErrors(raw);
  if (Object.keys(fields).length) throw new ContactInvalid(fields);
  const sender = createHash("sha256").update(`contact:${client}`).digest("hex").slice(0, 32);
  if (!await consume(`contact:${sender}`, 5, "1 hour") || !await consume("contact:all", 60, "1 hour")) throw new ContactRateLimited("Too many messages. Please try again in an hour.");
  await database().query("INSERT INTO weekendcheck.contact_messages(name, email, topic, link, message) VALUES ($1, $2, $3, $4, $5)", [input.name, input.email, input.topic, input.link, input.message]);
}

export async function listContactMessages(): Promise<ContactMessage[]> {
  const { rows } = await database().query<{ id: string; created_at: Date; name: string; email: string; topic: ContactTopic; link: string; message: string; status: "new" | "done" }>(
    "SELECT id, created_at, name, email, topic, link, message, status FROM weekendcheck.contact_messages ORDER BY status = 'done', created_at DESC LIMIT 500");
  return rows.map(({ created_at, ...row }) => ({ ...row, createdAt: created_at.toISOString() }));
}

export async function updateContactMessage(id: unknown, status: unknown) {
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/.test(id)) throw new Error("Message not found.");
  if (status === "delete") { await database().query("DELETE FROM weekendcheck.contact_messages WHERE id = $1", [id]); return; }
  if (status !== "new" && status !== "done") throw new Error("Invalid status.");
  await database().query("UPDATE weekendcheck.contact_messages SET status = $2 WHERE id = $1", [id, status]);
}
