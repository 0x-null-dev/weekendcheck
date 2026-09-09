import { changeState, readState } from "./editorial-store";
import { xPostErrors } from "./x-post-validation";
import { XSendError, type XPublisher } from "./x-publisher";

// Atomic claims prevent two workers sending the same item. Never retry an uncertain send.
export async function dispatchDue(publisher: XPublisher, now = Date.now()) {
  const initial = await readState();
  if (!initial.xPosts.some(p => (p.status === "scheduled" && Date.parse(p.scheduledAt!) <= now) || (p.status === "publishing" && Date.parse(p.updatedAt) < now - 20 * 60000))) return;
  const { result: job } = await changeState(null, state => {
    for (const post of state.xPosts) {
      if (post.status === "publishing" && Date.parse(post.updatedAt) < now - 20 * 60000) {
        post.status = "attention"; post.error = "Publishing was interrupted. Check X and finish the thread manually; it will not be resent automatically.";
      }
      if (post.status === "scheduled" && Date.parse(post.scheduledAt!) < now - 15 * 60000) {
        post.status = "failed"; post.error = "Missed the scheduled time by over 15 minutes. Choose a new time to avoid an unexpected late post.";
      }
    }
    const post = state.xPosts.filter(p => p.status === "scheduled" && Date.parse(p.scheduledAt!) <= now).sort((a,b) => a.scheduledAt!.localeCompare(b.scheduledAt!))[0];
    if (!post) return null;
    post.status = "publishing"; post.updatedAt = new Date(now).toISOString();
    return { post: structuredClone(post), handle: state.settings.handle };
  });
  if (!job) return;
  let sending = false;
  let sentCount = 0;
  try {
    const errors = xPostErrors(job.post.posts); if (errors.length) throw new Error(errors.join(" "));
    await publisher.verify(job.handle);
    let previous: string | undefined;
    for (const post of job.post.posts) {
      const ids: string[] = [];
      for (const asset of post.assets) ids.push(await publisher.upload(asset));
      sending = true;
      const id = await publisher.send(post, ids, previous);
      sentCount++;
      await changeState(null, state => {
        const item = state.xPosts.find(p => p.id === job.post.id)!;
        item.publishedIds.push(id); item.updatedAt = new Date().toISOString();
        item.xPostUrl = `https://x.com/i/web/status/${item.publishedIds[0]}`;
        if (item.publishedIds.length === item.posts.length) {
          item.status = "published"; item.error = "";
          const review = state.reviews.find(r => r.id === item.reviewId);
          if (review) review.xPostUrl = item.xPostUrl;
        }
      });
      sending = false;
      previous = id;
    }
  } catch (error) {
    // A successful send followed by a failed receipt write is uncertain too.
    const uncertain = sending && (!(error instanceof XSendError) || error.uncertain);
    await changeState(null, state => {
      const item = state.xPosts.find(p => p.id === job.post.id)!;
      item.status = uncertain || sentCount > 0 ? "attention" : "failed";
      item.error = error instanceof Error ? error.message : "X publishing failed.";
      if (sentCount > 0) item.error += " Part of this thread may be live. Check X and finish it manually.";
      item.updatedAt = new Date().toISOString();
    });
  }
}
