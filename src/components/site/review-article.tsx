import type { Project } from "@/lib/demo-data";

// The review's posts read as one article; each post is a section with its screenshots or video below the text.
export function ReviewArticle({ project }: { project: Project }) {
  const review = project.review;
  if (!review) return null;
  return <article className="review-article">
    {project.reviewTitle && <h2>{project.reviewTitle}</h2>}
    {review.posts.map((post, index) => <section className="review-part" key={index}>
      {post.text && <p>{post.text}</p>}
      {post.assets?.map(asset => <figure key={asset.id}>
        {asset.type === "video"
          ? <video src={asset.url} controls preload="metadata" aria-label={asset.alt || "Review video"} />
          : <a href={asset.url} target="_blank" rel="noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.url} alt={asset.alt || `${project.name} screenshot`} loading="lazy" />
          </a>}
        {asset.alt && <figcaption>{asset.alt}</figcaption>}
      </figure>)}
    </section>)}
  </article>;
}
