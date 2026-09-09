import { readState } from "@/lib/editorial-store";
import { isAdmin } from "@/lib/server-security";
import { loadMedia, mediaBucket, mediaDriver, publiclyVisibleMedia, validMediaName } from "@/lib/media-store";
export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!validMediaName(name)) return new Response("Not found", { status: 404 });
  try {
    if (!await isAdmin() && !publiclyVisibleMedia(await readState(), `/api/media/${name}`)) return new Response("Not found", { status: 404 });
    if (mediaDriver() === "supabase") {
      const origin = new URL(process.env.SUPABASE_URL!).origin;
      const response = await fetch(`${origin}/storage/v1/object/authenticated/${encodeURIComponent(mediaBucket())}/${encodeURIComponent(name)}`, { headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!, ...(request.headers.get("range") ? { Range: request.headers.get("range")! } : {}) }, cache: "no-store", signal: AbortSignal.timeout(30000) });
      if (![200,206,416].includes(response.status)) return new Response("Not found", { status: 404 });
      const headers = new Headers({ "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" });
      for (const key of ["Content-Type","Content-Length","Content-Range","Accept-Ranges"]) { const value = response.headers.get(key); if (value) headers.set(key, value); }
      return new Response(response.body, { status: response.status, headers });
    }
    const bytes = await loadMedia(name);
    const ext = name.split(".").pop()!;
    const types: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp", gif: "image/gif", mp4: "video/mp4", webm: "video/webm" };
    const headers: Record<string, string> = { "Content-Type": types[ext], "Accept-Ranges": "bytes", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
    const range = request.headers.get("range");
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match || (!match[1] && !match[2])) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${bytes.length}` } });
      const start = match[1] ? Number(match[1]) : Math.max(0, bytes.length - Number(match[2]));
      const end = match[1] && match[2] ? Math.min(Number(match[2]), bytes.length - 1) : bytes.length - 1;
      if (start > end || start >= bytes.length) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${bytes.length}` } });
      return new Response(new Uint8Array(bytes.subarray(start, end + 1)), { status: 206, headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${bytes.length}`, "Content-Length": String(end - start + 1) } });
    }
    return new Response(new Uint8Array(bytes), { headers: { ...headers, "Content-Length": String(bytes.length) } });
  } catch { return new Response("Not found", { status: 404 }); }
}
