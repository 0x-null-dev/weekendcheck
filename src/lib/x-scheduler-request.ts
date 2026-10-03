import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { noStore } from "./server-security";
import { createXPublisher, xPostingEnabled, xWriteConfigured } from "./x-publisher";
import { dispatchDue } from "./x-scheduler";
import { schedulerHeartbeat } from "./x-scheduler-status";

export function schedulerAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 32) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const supplied = Buffer.from(request.headers.get("authorization") || "");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function runSchedulerRequest(request: Request) {
  if (!schedulerAuthorized(request)) return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: noStore });
  // Preview deployments must never send from the production account.
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") return NextResponse.json({ error: "Posting is disabled outside production." }, { status: 403, headers: noStore });
  if (!xWriteConfigured() || !xPostingEnabled()) return NextResponse.json({ error: "X posting is paused or not configured." }, { status: 503, headers: noStore });
  const deadline = Date.now() + 240000;
  try {
    await schedulerHeartbeat();
    const livePublisher = createXPublisher();
    const publisher = { ...livePublisher, async upload(asset: Parameters<typeof livePublisher.upload>[0]) {
      // Bound download + X processing together. Uploading media alone never creates a tweet.
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        return await Promise.race([livePublisher.upload(asset), new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error("Attachment processing timed out. Check the media before rescheduling.")), 150000);
        })]);
      } finally { clearTimeout(timer); }
    } };
    let processed = 0;
    // Limit both time and queue size; the next tick continues any remaining work.
    while (processed < 10 && Date.now() + 60000 < deadline) {
      const result = await dispatchDue(publisher, Date.now(), { deadline });
      if (!result) break;
      processed++;
      if (result === "yielded") break;
    }
    await schedulerHeartbeat();
    return NextResponse.json({ ok: true, processed }, { headers: noStore });
  } catch {
    console.error("Scheduled X dispatch failed. Inspect the queue and database connection; uncertain sends are not retried.");
    return NextResponse.json({ error: "Scheduler could not finish. Check the queue and server logs." }, { status: 503, headers: noStore });
  }
}
