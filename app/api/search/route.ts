import { NextRequest, NextResponse } from 'next/server'
import schoolsData from '../../../public/schools.json'

type School = { id: number; name: string; address: string | null }

const allSchools = schoolsData as School[]

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') ?? '').trim()
  const exact = request.nextUrl.searchParams.get('exact')

  if (!q || q.length < 1) return NextResponse.json([])

  if (exact === 'true') {
    const school = allSchools.find(s => s.name.includes(q)) ?? null
    return NextResponse.json(school)
  }

  const results = allSchools
    .filter(s => s.name.includes(q))
    .slice(0, 10)

  return NextResponse.json(results)
}