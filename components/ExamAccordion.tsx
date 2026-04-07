'use client'

import { useState } from 'react'
import ExamDateButton from '@/components/ExamDateButton'

type ExamPeriod = {
  name: string
  dates: string[]
  startDate: string
  endDate: string
}

type Props = {
  exam: ExamPeriod
  schoolName: string
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

export default function ExamAccordion({ exam, schoolName }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      border: '0.5px solid var(--sage-border)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          background: open ? 'var(--sage-light)' : 'var(--sage-lightest)',
          padding: '14px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span style={{ color: 'var(--sage-text)', fontSize: '14px', fontWeight: '600' }}>
          {exam.name}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: 'var(--sage-muted)', fontSize: '13px' }}>
            {formatDate(exam.startDate)} ~ {formatDate(exam.endDate)}
          </span>
          <span style={{ color: 'var(--sage-muted)', fontSize: '12px' }}>
            {open ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {open && (
        <div style={{
          padding: '16px',
          background: 'white',
          borderTop: '0.5px solid var(--sage-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <p style={{ color: 'var(--sage-muted)', fontSize: '12px', margin: 0 }}>
            날짜를 클릭해서 시험 과목을 등록하세요
          </p>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', flexWrap: 'wrap' }}>
            {exam.dates.map((date) => (
              <ExamDateButton
                key={date}
                date={date}
                formattedDate={formatDate(date)}
                examName={exam.name}
                schoolName={schoolName}
                startDate={exam.startDate}
                endDate={exam.endDate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}