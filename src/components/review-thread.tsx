import type { Project } from "@/lib/demo-data";
import { defaultSettings, type Settings } from "@/lib/editorial";

export function ReviewThread({ project, author = defaultSettings }: { project: Project; author?: Settings }) {
  const review = project.review;
  if (!review) return null;
  const profile = `https://x.com/${author.handle}`;
  return <section className="review-thread">
    <div className="thread-label"><span>WEEKENDCHECK ON X</span><a href={review.xPostUrl || profile} target="_blank" rel="noreferrer">{review.xPostUrl ? "Open on X ↗" : "Follow on X ↗"}</a></div>
    {review.posts.map((post, index) => <article className="x-post" key={index}>
      <div className="thread-line"><a href={profile} target="_blank" rel="noreferrer" className="editor-avatar" aria-label={author.name}>
        {author.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={author.avatarUrl} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
        ) : author.name.slice(0, 1)}
      </a>{index < review.posts.length - 1 && <i />}</div>
      <div className="post-content"><div className="post-author"><a href={profile} target="_blank" rel="noreferrer"><b>{author.name}</b></a><span>@{author.handle}</span><em>·</em><span>{review.publishedAt}</span></div><p>{post.text}</p>
        {post.assets?.map(asset => asset.type === "video" ? <figure key={asset.id} style={{ margin: "12px 0" }}><video src={asset.url} controls preload="metadata" aria-label={asset.alt || "Review video"} style={{ width: "100%", borderRadius: 12 }} />{asset.alt && <figcaption>{asset.alt}</figcaption>}</figure> : <a key={asset.id} href={asset.url} target="_blank" rel="noreferrer" style={{ display: "block", margin: "12px 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset.url} alt={asset.alt || "Project screenshot"} style={{ width: "100%", borderRadius: 12 }} />
        </a>)}
      </div>
    </article>)}
  </section>;
}
