import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type SchoolLite = { id: number; name: string; address: string | null }
type ExactResult = SchoolLite | null

type CacheEntry<T> = {
  value: T
  expiresAt: number
}

// In-memory cache (per serverless instance). Helps a lot for repeated keystrokes.
const CACHE_TTL_MS = 60_000
const CACHE_MAX_ENTRIES = 500
const listCache = new Map<string, CacheEntry<SchoolLite[]>>()
const exactCache = new Map<string, CacheEntry<ExactResult>>()

function now() {
  return Date.now()
}

function getCached<T>(map: Map<string, CacheEntry<T>>, key: string): T | undefined {
  const hit = map.get(key)
  if (!hit) return undefined
  if (hit.expiresAt <= now()) {
    map.delete(key)
    return undefined
  }
  // LRU-ish: refresh insertion order
  map.delete(key)
  map.set(key, hit)
  return hit.value
}

function setCached<T>(map: Map<string, CacheEntry<T>>, key: string, value: T) {
  map.set(key, { value, expiresAt: now() + CACHE_TTL_MS })
  if (map.size <= CACHE_MAX_ENTRIES) return
  const firstKey = map.keys().next().value as string | undefined
  if (firstKey) map.delete(firstKey)
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  const exact = request.nextUrl.searchParams.get('exact')

  const query = (q ?? '').trim()
  if (!query || query.length < 1) {
    return NextResponse.json([])
  }

  if (exact === 'true') {
    const key = query.toLowerCase()
    const cached = getCached(exactCache, key)
    if (cached !== undefined) {
      return NextResponse.json(cached, {
        headers: {
          // allow CDN/browser caching briefly; safe (school list is not sensitive)
          'Cache-Control': 'public, max-age=10, s-maxage=60, stale-while-revalidate=300',
        },
      })
    }

    const school = await prisma.school.findFirst({
      where: {
        name: { contains: query },
      },
      select: { id: true, name: true, address: true },
    })
    const out = (school ?? null) satisfies ExactResult
    setCached(exactCache, key, out)
    return NextResponse.json(out, {
      headers: {
        'Cache-Control': 'public, max-age=10, s-maxage=60, stale-while-revalidate=300',
      },
    })
  }

  const key = query.toLowerCase()
  const cached = getCached(listCache, key)
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        'Cache-Control': 'public, max-age=10, s-maxage=60, stale-while-revalidate=300',
      },
    })
  }

  const schools = (await prisma.school.findMany({
    where: {
      name: { contains: query },
    },
    take: 10,
    orderBy: [{ name: 'asc' }, { address: 'asc' }, { id: 'asc' }],
    select: { id: true, name: true, address: true },
  })) satisfies SchoolLite[]

  setCached(listCache, key, schools)

  return NextResponse.json(schools, {
    headers: {
      'Cache-Control': 'public, max-age=10, s-maxage=60, stale-while-revalidate=300',
    },
  })
}