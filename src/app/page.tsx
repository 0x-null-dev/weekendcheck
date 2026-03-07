import { Hero } from "@/components/Hero";
import { FreshlyChecked } from "@/components/FreshlyChecked";
import { ThePile } from "@/components/ThePile";
import { SubmitCTA } from "@/components/SubmitCTA";
import {
  getInReviewProject,
  getQueueProjects,
  getCheckedWithReviews,
  getCheckedProjects,
  projects,
} from "@/lib/data";

export default function Home() {
  const inReview = getInReviewProject();
  const queue = getQueueProjects();
  const checked = getCheckedProjects();
  const checkedWithReviews = getCheckedWithReviews();
  return (
    <>
      <Hero
        submitted={projects.length}
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
