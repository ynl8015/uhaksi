import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const prisma = new PrismaClient()

async function main() {
  const csvPath = path.join(__dirname, 'schools.csv')
  const content = fs.readFileSync(csvPath, 'utf-8')
  const lines = content.split('\n')

  const headers = lines[0].split(',')
  const nameIdx = headers.indexOf('학교명')
  const typeIdx = headers.indexOf('학교급구분')
  const addressIdx = headers.indexOf('소재지도로명주소')
  const statusIdx = headers.indexOf('운영상태')

  const schools = []

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',')
    if (!cols[typeIdx]) continue
    if (cols[typeIdx].trim() !== '고등학교') continue
    if (cols[statusIdx].trim() !== '운영') continue

    schools.push({
      name: cols[nameIdx].trim(),
      address: cols[addressIdx].trim(),
    })
  }

  console.log(`총 ${schools.length}개 고등학교 삽입 중...`)

  await prisma.school.createMany({
    data: schools,
    skipDuplicates: true,
  })

  console.log('완료!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())