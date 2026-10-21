import { getPublicData } from "@/lib/public-data";
import { ogImage, ogSize } from "@/lib/og-image";

export const alt = "A project review on 0xAlex Check";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = (await getPublicData()).reviewedProjects.find(p => p.slug === slug);
  if (!project?.reviewed) return ogImage({ kicker: "0xAlex Check", title: "Project review", footer: "check.0xalex.com" });
  return ogImage({
    kicker: `${project.reviewed === "deep" ? "Deep review" : "Quick take"} · 0xAlex Check`,
    title: project.name,
    subtitle: project.reviewTitle || project.description,
    footer: [project.handle && `by @${project.handle}`, "reviewed by 0xAlex"].filter(Boolean).join(" · "),
  });
}
