import { NextResponse } from "next/server";
import { xUrl } from "@/lib/editorial-actions";
import { canonicalUrl, type Candidate } from "@/lib/editorial";
import { adminApiGuard } from "@/lib/server-security";
import { readJson } from "@/lib/request-body";

export async function POST(request: Request) {
  const denied = await adminApiGuard(request); if (denied) return denied;
  if (!process.env.X_BEARER_TOKEN) return NextResponse.json({ error: "X is not connected. Paste project links in the Import tab, or add X_BEARER_TOKEN on the server to fetch replies." }, { status: 503 });
  try {
    const body = await readJson(request, 10000);
    const source = xUrl(body.url);
    const id = source.match(/\/status\/(\d+)/)?.[1];
    if (!id) throw new Error("Enter the URL of your X call post.");
    const url = new URL("https://api.x.com/2/tweets/search/recent");
    url.searchParams.set("query", `conversation_id:${id} -is:retweet`);
    url.searchParams.set("max_results", "100");
    url.searchParams.set("tweet.fields", "entities,author_id,referenced_tweets");
    url.searchParams.set("expansions", "author_id");
    url.searchParams.set("user.fields", "username");
    if (body.nextToken) {
      if (typeof body.nextToken !== "string" || body.nextToken.length > 2000) throw new Error("Invalid pagination token.");
      url.searchParams.set("next_token", body.nextToken);
    }
    const response = await fetch(url, { headers: { Authorization: `Bearer ${process.env.X_BEARER_TOKEN}` }, signal: AbortSignal.timeout(20000), cache: "no-store" });
    if (!response.ok) throw new Error(response.status === 429 ? "X rate limit reached. Try later or paste the replies manually." : "X could not fetch replies. Check the token and API access, or paste replies manually.");
    type XPost = { id: string; text: string; author_id: string; referenced_tweets?: { id: string; type: string }[]; entities?: { urls?: { expanded_url?: string; unwound_url?: string; title?: string; description?: string }[] } };
    const data: { data?: XPost[]; includes?: { users?: { id: string; username: string }[] }; meta?: { next_token?: string }; errors?: unknown[] } = await response.json();
    if (data.errors?.length) throw new Error("X returned an incomplete response. Try again or use paste import.");
    const candidates: Candidate[] = [];
    for (const post of data.data || []) {
      if (!post.referenced_tweets?.some(ref => ref.type === "replied_to")) continue;
      const handle = data.includes?.users?.find(user => user.id === post.author_id)?.username || "";
      for (const entity of post.entities?.urls || []) {
        try {
          const projectUrl = canonicalUrl(entity.unwound_url || entity.expanded_url || "");
          if (/(^|\.)(x\.com|twitter\.com|t\.co)$/.test(new URL(projectUrl).hostname)) continue;
          candidates.push({ name: (entity.title || new URL(projectUrl).hostname).slice(0, 120), url: projectUrl, handle, description: (entity.description || post.text).slice(0, 2000), source: `https://x.com/${handle || "i/web"}/status/${post.id}` });
        } catch { /* Skip invalid entity URLs. */ }
      }
    }
    return NextResponse.json({ candidates, replyCount: data.data?.length || 0, nextToken: data.meta?.next_token || null });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to fetch replies." }, { status: 400 }); }
}
