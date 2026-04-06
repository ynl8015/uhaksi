'use client'

import { useState } from 'react'

type Subject = {
  id: number
  subject: string
  textbook: string | null
  pages: string | null
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
    return <p>등록된 시험 정보가 없습니다.</p>
  }

  return (
    <div>
      {exams.map((exam) => (
        <div key={exam.id}>
          <button onClick={() => setOpenId(openId === exam.id ? null : exam.id)}>
            {exam.title} ({exam.startDate} ~ {exam.endDate})
          </button>

          {openId === exam.id && (
            <ul>
              {exam.subjects.map((s) => (
                <li key={s.id}>
                  <strong>{s.subject}</strong>
                  {s.textbook && ` | 교재: ${s.textbook}`}
                  {s.pages && ` | 범위: ${s.pages}`}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}