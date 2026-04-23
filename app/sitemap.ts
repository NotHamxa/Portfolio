import type { MetadataRoute } from "next"
import { getProjects } from "@/lib/db"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hamzahmed.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date()

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 1,
        },
    ]

    let projectRoutes: MetadataRoute.Sitemap = []
    try {
        const projects = await getProjects()
        projectRoutes = projects
            .filter((p) => p.show !== false)
            .map((p) => ({
                url: `${SITE_URL}/project/${p.id}`,
                lastModified: now,
                changeFrequency: "monthly" as const,
                priority: 0.8,
            }))
    } catch {

    }

    return [...staticRoutes, ...projectRoutes]
}
