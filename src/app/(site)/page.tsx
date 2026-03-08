export const dynamic = "force-dynamic";

import { Hero } from "@/components/Hero";
import { FreshlyChecked } from "@/components/FreshlyChecked";
import { ThePile } from "@/components/ThePile";
import { SubmitCTA } from "@/components/SubmitCTA";
import {
  getInReviewProject,
  getQueueProjects,
  getCheckedProjectsWithReviews,
  getCheckedProjects,
  getAllProjects,
} from "@/lib/db/queries";

export default async function Home() {
  const [inReview, queue, checked, checkedWithReviews, allProjects] = await Promise.all([
    getInReviewProject(),
    getQueueProjects(),
    getCheckedProjects(),
    getCheckedProjectsWithReviews(),
    getAllProjects(),
  ]);
  return (
    <>
      <Hero
        submitted={allProjects.length}
        reviewed={checked.length}
        inQueue={queue.length}
        inReviewProject={inReview}
      />

      <div className="mx-auto max-w-5xl px-6">
        <div className="h-px bg-border" />
      </div>

      <ThePile projects={queue} />

      <div className="mx-auto max-w-5xl px-6">
        <div className="h-px bg-border" />
      </div>

      <FreshlyChecked items={checkedWithReviews} />

      <SubmitCTA />
    </>
  );
}
