import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const base = site.replace(/\/$/, '')
  const now = new Date()

  // MVP: static routes only. (Dynamic school pages can be added later.)
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/forgot`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/reset-password`, lastModified: now, changeFrequency: 'monthly', priority: 0.2 },
  ]
}

