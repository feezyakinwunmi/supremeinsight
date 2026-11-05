import type { MetadataRoute } from "next";
import { getAllPublishedSlugs, getDepartments } from "@/lib/queries";
import { siteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [posts, departments] = await Promise.all([getAllPublishedSlugs(), getDepartments()]);
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.3 },
    ...departments.map((d) => ({ url: `${base}/section/${d.slug}`, changeFrequency: "daily" as const, priority: 0.7 })),
    ...posts.map((p) => ({
      url: `${base}/post/${p.slug}`,
      lastModified: p.published_at ? new Date(p.published_at) : undefined,
      priority: 0.8,
    })),
  ];
}
