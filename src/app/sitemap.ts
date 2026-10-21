import type { MetadataRoute } from "next";
import { getPublicData } from "@/lib/public-data";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { reviewedProjects } = await getPublicData();
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/reviews`, changeFrequency: "weekly", priority: 0.8 },
    ...reviewedProjects.map(project => ({ url: `${siteUrl}/projects/${project.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${siteUrl}/budget`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/contact`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${siteUrl}/research`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/research/privacy`, changeFrequency: "yearly", priority: 0.1 },
  ];
}
