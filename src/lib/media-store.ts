import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { storageDirectory } from "./editorial-store";
import { publicData } from "./public-data";
import type { EditorialState } from "./editorial";

export const mediaTypes: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp", gif: "image/gif", mp4: "video/mp4", webm: "video/webm" };
export const validMediaName = (name: string) => /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(png|jpg|webp|gif|mp4|webm)$/.test(name);
export function mediaDriver() {
  const driver = process.env.MEDIA_STORAGE || (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY ? "supabase" : "local");
  if (!["supabase", "local"].includes(driver)) throw new Error("MEDIA_STORAGE must be supabase or local.");
  if (process.env.NODE_ENV === "production" && driver === "local" && process.env.MEDIA_STORAGE !== "local") throw new Error("Configure Supabase Storage or explicitly select a persistent local media volume.");
  return driver;
}
export const mediaBucket = () => process.env.SUPABASE_STORAGE_BUCKET || "weekendcheck-media";
export function supabaseStorage() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase Storage credentials are missing.");
  const url = new URL(process.env.SUPABASE_URL);
  if (url.protocol !== "https:") throw new Error("Supabase Storage must use HTTPS.");
  return createClient(url.origin, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}
export async function initializeMediaStorage() {
  if (mediaDriver() === "local") { await mkdir(path.join(storageDirectory(), "media"), { recursive: true }); return; }
  const client = supabaseStorage();
  const { data, error } = await client.storage.getBucket(mediaBucket());
  if (data) { if (data.public) throw new Error("Use a private Supabase bucket for review drafts."); return; }
  if (error && !["400", "404"].includes(String(error.status))) throw new Error("Could not inspect the media bucket. Check Supabase credentials.");
  const result = await client.storage.createBucket(mediaBucket(), { public: false, fileSizeLimit: 50 * 1024 * 1024, allowedMimeTypes: Object.values(mediaTypes) });
  if (result.error) throw new Error("Could not create the private Supabase media bucket.");
}
export async function saveMedia(name: string, bytes: Buffer) {
  if (!validMediaName(name)) throw new Error("Invalid media filename.");
  if (mediaDriver() === "local") {
    await mkdir(path.join(storageDirectory(), "media"), { recursive: true });
    await writeFile(path.join(storageDirectory(), "media", name), bytes, { flag: "wx", mode: 0o600 });
  } else {
    const { error } = await supabaseStorage().storage.from(mediaBucket()).upload(name, bytes, { contentType: mediaTypes[name.split(".").pop()!], upsert: false });
    if (error) throw new Error("Media upload failed. Check Supabase Storage configuration.");
  }
}
export async function loadMedia(name: string) {
  if (!validMediaName(name)) throw new Error("Invalid media filename.");
  if (mediaDriver() === "local") return readFile(path.join(storageDirectory(), "media", name));
  const { data, error } = await supabaseStorage().storage.from(mediaBucket()).download(name);
  if (error || !data) throw new Error("Media could not be downloaded.");
  return Buffer.from(await data.arrayBuffer());
}
export function publiclyVisibleMedia(state: EditorialState, url: string) {
  const visible = publicData(state);
  return visible.settings.avatarUrl === url || visible.weeks.some(week => week.entries.some(project => project.logoUrl === url || project.review?.posts.some(post => post.assets?.some(asset => asset.url === url))));
}
