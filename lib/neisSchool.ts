export type NeisSchoolRow = {
  ATPT_OFCDC_SC_CODE: string
  SD_SCHUL_CODE: string
  SCHUL_NM: string
  ORG_RDNMA?: string
  ATPT_OFCDC_SC_NM?: string
}

function normalizeAddr(addr: string): string {
  return addr.replace(/\s+/g, ' ').trim()
}

function addrScore(candidateAddr: string, targetAddr: string): number {
  const cand = normalizeAddr(candidateAddr)
  const target = normalizeAddr(targetAddr)
  if (!cand || !target) return 0

  let score = 0
  if (cand === target) score += 100

  // broad match (city/province + district)
  const targetTokens = target.split(' ').filter(Boolean)
  const candTokens = cand.split(' ').filter(Boolean)

  // prioritize first 2-3 tokens (e.g. "서울특별시 강동구")
  const highValue = targetTokens.slice(0, 3)
  for (const t of highValue) {
    if (cand.includes(t)) score += 20
  }

  // token overlap
  const candSet = new Set(candTokens)
  for (const t of targetTokens) {
    if (candSet.has(t)) score += 2
  }

  // substring containment
  if (cand.includes(target) || target.includes(cand)) score += 30

  return score
}

export async function resolveNeisSchoolCodesByAddress(opts: {
  apiKey: string
  schoolName: string
  address?: string | null
}): Promise<{ neisRegionCode: string; neisCode: string } | null> {
  const { apiKey, schoolName, address } = opts
  if (!apiKey) return null

  const url =
    `https://open.neis.go.kr/hub/schoolInfo?` +
    `KEY=${encodeURIComponent(apiKey)}` +
    `&Type=json` +
    `&pIndex=1&pSize=1000` +
    `&SCHUL_NM=${encodeURIComponent(schoolName)}`

  const res = await fetch(url, { cache: 'no-store' })
  const data = await res.json()
  const rows = (data?.schoolInfo?.[1]?.row ?? []) as NeisSchoolRow[]
  if (rows.length === 0) return null

  if (!address) {
    const first = rows[0]
    return { neisRegionCode: first.ATPT_OFCDC_SC_CODE, neisCode: first.SD_SCHUL_CODE }
  }

  let best: { row: NeisSchoolRow; score: number } | null = null
  for (const row of rows) {
    const s = addrScore(row.ORG_RDNMA ?? '', address)
    if (!best || s > best.score) best = { row, score: s }
  }

  const chosen = best?.row ?? rows[0]
  return { neisRegionCode: chosen.ATPT_OFCDC_SC_CODE, neisCode: chosen.SD_SCHUL_CODE }
}

