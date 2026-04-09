'use client'

import { useState } from 'react'

type Subject = {
  id: number
  subject: string
  grade: number | null
  period: number | null
  date: string | null
}

type Exam = {
  id: number
  title: string
  startDate: string
  endDate: string
  subjects: Subject[]
}

type Props = {
  exams: Exam[]
}

export default function ExamList({ exams }: Props) {
  const [openId, setOpenId] = useState<number | null>(null)

  if (exams.length === 0) {
    return <p style={{ color: 'var(--sage-muted)', fontSize: '14px' }}>등록된 시험 정보가 없습니다.</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {exams.map((exam) => {
        const dates = [...new Set(exam.subjects.map(s => s.date).filter(Boolean))].sort() as string[]
        const grades = [1, 2, 3]

        return (
          <div key={exam.id} style={{ border: '0.5px solid var(--sage-border)', borderRadius: '12px', overflow: 'hidden' }}>
            <button
              onClick={() => setOpenId(openId === exam.id ? null : exam.id)}
              style={{
                width: '100%',
                background: openId === exam.id ? 'var(--sage-light)' : 'var(--sage-lightest)',
                padding: '14px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span style={{ color: 'var(--sage-text)', fontSize: '14px', fontWeight: '600' }}>
                {exam.title}
              </span>
              <span style={{ color: 'var(--sage-muted)', fontSize: '12px' }}>
                {openId === exam.id ? '▲' : '▼'}
              </span>
            </button>

            {openId === exam.id && (
              <div style={{ padding: '16px', background: 'white', borderTop: '0.5px solid var(--sage-border)', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px 12px', background: 'var(--sage-lightest)', color: 'var(--sage-text)', fontWeight: '600', border: '0.5px solid var(--sage-border)', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        학년
                      </th>
                      {dates.map(date => {
                        const month = parseInt(date.slice(4, 6))
                        const day = parseInt(date.slice(6, 8))
                        const weekdays = ['일', '월', '화', '수', '목', '금', '토']
                        const d = new Date(parseInt(date.slice(0, 4)), month - 1, day)
                        return (
                          <th key={date} style={{ padding: '8px 12px', background: 'var(--sage-lightest)', color: 'var(--sage-text)', fontWeight: '600', border: '0.5px solid var(--sage-border)', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            {month}/{day} ({weekdays[d.getDay()]})
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map(grade => (
                      <tr key={grade}>
                        <td style={{ padding: '8px 12px', border: '0.5px solid var(--sage-border)', textAlign: 'center', fontWeight: '600', color: 'var(--sage-text)', background: 'var(--sage-lightest)', whiteSpace: 'nowrap' }}>
                          {grade}학년
                        </td>
                        {dates.map(date => {
                          const cell = exam.subjects.filter(s => s.date === date && s.grade === grade)
                          return (
                            <td key={date} style={{ padding: '8px 12px', border: '0.5px solid var(--sage-border)', verticalAlign: 'top' }}>
                              {cell.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {cell.sort((a, b) => (a.period ?? 0) - (b.period ?? 0)).map(s => (
                                    <div key={s.id}>
                                      <p style={{ color: 'var(--sage-text)', fontWeight: '600', margin: 0, fontSize: '13px' }}>
                                        {s.period}교시 {s.subject}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span style={{ color: 'var(--sage-border)', fontSize: '12px' }}>-</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}