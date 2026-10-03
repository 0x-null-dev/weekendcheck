import { runSchedulerRequest } from "@/lib/x-scheduler-request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Supabase Cron uses POST. GET also supports Vercel Cron on eligible plans.
export const POST = runSchedulerRequest;
export const GET = runSchedulerRequest;
