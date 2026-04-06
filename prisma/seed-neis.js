import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const API_KEY = process.env.NEIS_API_KEY

async function fetchSchoolCodes(pageIndex = 1) {
  const url = `https://open.neis.go.kr/hub/schoolInfo?KEY=${API_KEY}&Type=json&pIndex=${pageIndex}&pSize=1000&SCHUL_KND_SC_NM=고등학교`
  const res = await fetch(url)
  const data = await res.json()

  if (!data.schoolInfo) return []
  return data.schoolInfo[1].row
}

async function main() {
  console.log('나이스 학교 코드 가져오는 중...')

  let allSchools = []
  let page = 1

  while (true) {
    const rows = await fetchSchoolCodes(page)
    if (rows.length === 0) break
    allSchools = [...allSchools, ...rows]
    console.log(`${page}페이지 완료 (누적 ${allSchools.length}개)`)
    if (rows.length < 1000) break
    page++
  }

  console.log(`총 ${allSchools.length}개 학교 코드 업데이트 중...`)

  let updated = 0
  for (const school of allSchools) {
    const result = await prisma.school.updateMany({
      where: { name: school.SCHUL_NM },
      data: {
        neisRegionCode: school.ATPT_OFCDC_SC_CODE,
        neisCode: school.SD_SCHUL_CODE,
      }
    })
    if (result.count > 0) updated++
  }

  console.log(`완료! ${updated}개 학교 코드 업데이트됨`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())