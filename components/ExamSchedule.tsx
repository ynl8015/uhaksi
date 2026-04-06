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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {exams.map((exam) => (
          <div key={exam.name} style={{
            border: '0.5px solid var(--sage-border)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            <div style={{
              background: 'var(--sage-light)',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ color: 'var(--sage-text)', fontSize: '14px', fontWeight: '600' }}>
                {exam.name}
              </span>
              <span style={{ color: 'var(--sage-muted)', fontSize: '13px' }}>
                {formatDate(exam.startDate)} ~ {formatDate(exam.endDate)}
              </span>
            </div>
            <div style={{
              padding: '12px 16px',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              background: 'white',
            }}>
              {exam.dates.map((date) => (
                <span key={date} style={{
                  background: 'var(--sage-lightest)',
                  border: '0.5px solid var(--sage-border)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '13px',
                  color: 'var(--sage-text)',
                  cursor: 'pointer',
                }}>
                  {formatDate(date)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }