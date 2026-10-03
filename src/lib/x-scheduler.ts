import { changeState, readState } from "./editorial-store";
import { xPostErrors } from "./x-post-validation";
import { XSendError, type XPublisher } from "./x-publisher";

// Atomic claims prevent two workers sending the same item. Never retry an uncertain send.
export async function dispatchDue(publisher: XPublisher, now = Date.now(), options: { deadline?: number } = {}) {
  const initial = await readState();
  if (!initial.xPosts.some(p => (p.status === "scheduled" && Date.parse(p.scheduledAt!) <= now) || (p.status === "publishing" && Date.parse(p.updatedAt) < now - 20 * 60000))) return;
  const { result: job } = await changeState(null, state => {
    for (const post of state.xPosts) {
      if (post.status === "publishing" && Date.parse(post.updatedAt) < now - 20 * 60000) {
        post.status = "attention"; post.error = "Publishing was interrupted. Check X and finish the thread manually; it will not be resent automatically.";
      }
      if (post.status === "scheduled" && !post.publishedIds.length && Date.parse(post.scheduledAt!) < now - 15 * 60000) {
        post.status = "failed"; post.error = "Missed the scheduled time by over 15 minutes. Choose a new time to avoid an unexpected late post.";
      }
    }
    const post = state.xPosts.filter(p => p.status === "scheduled" && Date.parse(p.scheduledAt!) <= now).sort((a,b) => a.scheduledAt!.localeCompare(b.scheduledAt!))[0];
    if (!post) return null;
    post.status = "publishing"; post.updatedAt = new Date(now).toISOString();
    return { post: structuredClone(post), handle: state.settings.handle };
  });
  if (!job) return false;
  const jobId = job.post.id;
  let sending = false;
  let sentCount = job.post.publishedIds.length;
  const hasTime = (reserve: number) => options.deadline === undefined || Date.now() + reserve < options.deadline;
  // Yield only between confirmed sends. Uncertain sends still require manual inspection.
  async function yieldJob() {
    await changeState(null, state => {
      const item = state.xPosts.find(p => p.id === jobId)!;
      item.status = "scheduled"; item.updatedAt = new Date().toISOString();
    });
  }
  try {
    const errors = xPostErrors(job.post.posts); if (errors.length) throw new Error(errors.join(" "));
    if (!hasTime(60000)) { await yieldJob(); return "yielded" as const; }
    await publisher.verify(job.handle);
    let previous: string | undefined = job.post.publishedIds.at(-1);
    for (const post of job.post.posts.slice(sentCount)) {
      const cached = job.post.uploadedMedia;
      const ids = cached?.postIndex === sentCount && Date.parse(cached.createdAt) > now - 3600000 ? [...cached.ids] : [];
      for (const asset of post.assets.slice(ids.length)) {
        if (!hasTime(180000)) { await yieldJob(); return "yielded" as const; }
        ids.push(await publisher.upload(asset));
        // Preserve uploaded media too, so slow multi-image posts can make progress across ticks.
        await changeState(null, state => {
          state.xPosts.find(p => p.id === jobId)!.uploadedMedia = { postIndex: sentCount, ids: [...ids], createdAt: new Date().toISOString() };
        });
      }
      if (!hasTime(60000)) { await yieldJob(); return "yielded" as const; }
      sending = true;
      const id = await publisher.send(post, ids, previous);
      sentCount++;
      await changeState(null, state => {
        const item = state.xPosts.find(p => p.id === job.post.id)!;
        item.publishedIds.push(id); item.updatedAt = new Date().toISOString();
        delete item.uploadedMedia;
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
  return true;
}
