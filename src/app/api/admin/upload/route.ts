import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { saveMedia } from "@/lib/media-store";
import { adminApiGuard, noStore } from "@/lib/server-security";
import { readBody } from "@/lib/request-body";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const denied = await adminApiGuard(request); if (denied) return denied;
  try {
    if (Number(request.headers.get("content-length")) > 51 * 1024 * 1024) throw new Error("Upload a file smaller than 50 MB.");
    const raw = await readBody(request, 51 * 1024 * 1024);
    const form = await new Response(new Uint8Array(raw), { headers: { "Content-Type": request.headers.get("content-type") || "" } }).formData();
    const file = form.get("file");
    if (!(file instanceof File) || !file.size || file.size > 50 * 1024 * 1024) throw new Error("Choose a file between 1 byte and 50 MB.");
    const bytes = Buffer.from(await file.arrayBuffer());
    let extension = "";
    if (bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) extension = "png";
    else if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) extension = "jpg";
    else if (bytes.toString("ascii", 0, 3) === "GIF") extension = "gif";
    else if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") extension = "webp";
    else if (bytes.toString("ascii", 4, 8) === "ftyp" && file.type === "video/mp4") extension = "mp4";
    else if (bytes.subarray(0, 4).equals(Buffer.from([26,69,223,163])) && file.type === "video/webm") extension = "webm";
    if (!extension) throw new Error("Use PNG, JPG, WebP, GIF, MP4, or WebM.");
    const id = randomUUID();
    await saveMedia(`${id}.${extension}`, bytes);
    return NextResponse.json({ id, url: `/api/media/${id}.${extension}`, type: ["mp4", "webm"].includes(extension) ? "video" : "image", alt: "" }, { headers: noStore });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 400 }); }
}
