import { ApiResponseError, EUploadMimeType, TwitterApi } from "twitter-api-v2";
import type { Asset, Post } from "./editorial";
import { loadMedia } from "./media-store";

export const xWriteConfigured = () => Boolean(process.env.X_API_KEY && process.env.X_API_SECRET && process.env.X_ACCESS_TOKEN && process.env.X_ACCESS_TOKEN_SECRET);
export const xPostingEnabled = () => process.env.X_POSTING_ENABLED === "true";
export class XSendError extends Error {
  constructor(message: string, public uncertain: boolean) { super(message); }
}
export type XPublisher = {
  verify: (handle: string) => Promise<void>;
  upload: (asset: Asset) => Promise<string>;
  send: (post: Post, mediaIds: string[], replyTo?: string) => Promise<string>;
};
export function createXPublisher(): XPublisher {
  if (!xWriteConfigured() || !xPostingEnabled()) throw new Error("X posting is not enabled and configured.");
  const client = new TwitterApi({ appKey: process.env.X_API_KEY!, appSecret: process.env.X_API_SECRET!, accessToken: process.env.X_ACCESS_TOKEN!, accessSecret: process.env.X_ACCESS_TOKEN_SECRET! });
  return {
    async verify(handle) {
      const result = await client.v2.get<{ data: { username: string } }>("users/me", {}, { timeout: 20000 });
      if (result.data.username.toLowerCase() !== handle.toLowerCase()) throw new Error("The connected X account does not match the handle in Settings.");
    },
    async upload(asset) {
      const match = asset.url.match(/^\/api\/media\/([a-f0-9-]+\.(png|jpg|gif|webp|mp4))$/);
      if (!match) throw new Error("Upload this attachment locally before scheduling it on X.");
      const buffer = await loadMedia(match[1]);
      const types: Record<string, EUploadMimeType> = { png: EUploadMimeType.Png, jpg: EUploadMimeType.Jpeg, gif: EUploadMimeType.Gif, webp: EUploadMimeType.Webp, mp4: EUploadMimeType.Mp4 };
      const limit = match[2] === "mp4" ? 50_000_000 : match[2] === "gif" ? 15_000_000 : 5_000_000;
      if (buffer.length > limit) throw new Error(`Attachment too large for X: use at most ${limit / 1_000_000} MB.`);
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        const id = await Promise.race([client.v2.uploadMedia(buffer, { media_type: types[match[2]] }), new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("X media processing timed out. No post was sent for this attachment.")), 120000); })]);
        if (asset.alt && asset.type === "image") await client.v2.post("media/metadata", { id, metadata: { alt_text: { text: asset.alt } } }, { timeout: 20000 });
        return id;
      } finally { clearTimeout(timer); }
    },
    async send(post, mediaIds, replyTo) {
      try {
        const result = await client.v2.post<{ data: { id: string } }>("tweets", {
          ...(post.text ? { text: post.text } : {}),
          ...(mediaIds.length ? { media: { media_ids: mediaIds } } : {}),
          ...(replyTo ? { reply: { in_reply_to_tweet_id: replyTo } } : {}),
        }, { timeout: 20000 });
        if (!/^\d+$/.test(result.data?.id)) throw new Error("Missing X receipt.");
        return result.data.id;
      } catch (error) {
        const rejected = error instanceof ApiResponseError && error.code >= 400 && error.code < 500 && error.code !== 408;
        throw new XSendError(rejected ? `X rejected the post (HTTP ${(error as ApiResponseError).code}). Check API access, rate limits and post content.` : "X did not confirm whether the post was sent. Check your profile before posting again.", !rejected);
      }
    },
  };
}
