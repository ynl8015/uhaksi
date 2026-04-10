import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getSiteUrl } from '@/lib/siteUrl'

/** 학교 목록 반영 주기 (초). 빌드 시 DB 없으면 학교 URL 생략. */
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl()
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/community`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${base}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/forgot`, lastModified: now, changeFrequency: 'monthly', priority: 0.25 },
    { url: `${base}/reset-password`, lastModified: now, changeFrequency: 'monthly', priority: 0.2 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.35 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.35 },
  ]

  try {
    const schools = await prisma.school.findMany({
      select: { id: true, createdAt: true },
      orderBy: { id: 'asc' },
    })
    const schoolRoutes: MetadataRoute.Sitemap = schools.map((s) => ({
      url: `${base}/school/${s.id}`,
      lastModified: s.createdAt,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }))
    return [...staticRoutes, ...schoolRoutes]
  } catch {
    return staticRoutes
  }
}
