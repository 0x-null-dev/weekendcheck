import twitterText from "twitter-text";
import type { Post } from "./editorial";

export const xTextLength = (text: string) => twitterText.parseTweet(text).weightedLength;
export function xPostErrors(posts: Post[]): string[] {
  return posts.flatMap((post, index) => {
    const errors: string[] = [];
    const label = `Post ${index + 1}`;
    if (!post.text.trim() && !post.assets.length) errors.push(`${label}: add text or media.`);
    if (post.text.trim() && !twitterText.parseTweet(post.text).valid) errors.push(`${label}: use valid text within X's standard 280-character limit.`);
    if (post.assets.some(a => !/^\/api\/media\/[a-f0-9-]+\.(png|jpg|webp|gif|mp4)$/.test(a.url))) errors.push(`${label}: upload attachments here (PNG, JPG, WebP, GIF or MP4). External media URLs and WebM are website-only.`);
    if (post.assets.length > 4 || (post.assets.some(a => a.type === "video" || a.url.endsWith(".gif")) && post.assets.length > 1)) errors.push(`${label}: use up to four still images, or one video/GIF.`);
    return errors;
  });
}
