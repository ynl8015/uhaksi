import ExamDateButton from '@/components/ExamDateButton'
import ExamAccordion from '@/components/ExamAccordion'

type ExamPeriod = {
  name: string
  dates: string[]
  startDate: string
  endDate: string
}

type Props = {
  schoolName: string
  neisRegionCode: string
  neisCode: string
}

function formatDate(yyyymmdd: string) {
  const month = parseInt(yyyymmdd.slice(4, 6))
  const day = parseInt(yyyymmdd.slice(6, 8))
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const date = new Date(
    parseInt(yyyymmdd.slice(0, 4)),
    month - 1,
    day
  )
  return `${month}/${day} (${weekdays[date.getDay()]})`
}

async function getExamSchedule(neisRegionCode: string, neisCode: string): Promise<ExamPeriod[]> {
  const year = new Date().getFullYear()
  const url = `https://open.neis.go.kr/hub/SchoolSchedule?KEY=${process.env.NEIS_API_KEY}&Type=json&ATPT_OFCDC_SC_CODE=${neisRegionCode}&SD_SCHUL_CODE=${neisCode}&AA_FROM_YMD=${year}0101&AA_TO_YMD=${year}1231`

  const res = await fetch(url, { next: { revalidate: 3600 } })
  const data = await res.json()

  if (!data.SchoolSchedule) return []

  const rows = data.SchoolSchedule[1].row
  const examKeywords = ['고사', '시험', '지필', '평가']
  const examRows = rows.filter((row: { EVENT_NM: string }) =>
    examKeywords.some(keyword => row.EVENT_NM.includes(keyword))
  )

  const grouped: Record<string, string[]> = {}
  for (const row of examRows) {
    if (!grouped[row.EVENT_NM]) grouped[row.EVENT_NM] = []
    grouped[row.EVENT_NM].push(row.AA_YMD)
  }

  return Object.entries(grouped).map(([name, dates]) => ({
    name,
    dates: dates.sort(),
    startDate: dates.sort()[0],
    endDate: dates.sort()[dates.length - 1],
  }))
}

export default async function ExamSchedule({ schoolName, neisRegionCode, neisCode }: Props) {
  const exams = await getExamSchedule(neisRegionCode, neisCode)

  if (exams.length === 0) {
    return (
      <p style={{ color: 'var(--sage-muted)', fontSize: '14px' }}>
        시험 일정 정보가 없습니다.
      </p>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {exams.map((exam) => (
        <ExamAccordion
          key={exam.name}
          exam={exam}
          schoolName={schoolName}
        />
      ))}
    </div>
  )

}