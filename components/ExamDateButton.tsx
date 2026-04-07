'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Subject = {
  grade: number
  period: number
  subject: string
  textbook: string
  pages: string
}

type Props = {
  date: string
  formattedDate: string
  examName: string
  schoolName: string
  startDate: string
  endDate: string
}

export default function ExamDateButton({ date, formattedDate, examName, schoolName, startDate, endDate }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([
    { grade: 1, period: 1, subject: '', textbook: '', pages: '' }
  ])
  const [loading, setLoading] = useState(false)

  const handleClick = () => {
    if (!session) {
      router.push('/login')
      return
    }
    setOpen(!open)
  }

  const addSubject = () => {
    setSubjects([...subjects, { grade: 1, period: 1, subject: '', textbook: '', pages: '' }])
  }

  const updateSubject = (index: number, field: keyof Subject, value: string | number) => {
    const updated = [...subjects]
    updated[index] = { ...updated[index], [field]: value }
    setSubjects(updated)
  }

  const handleSubmit = async () => {
    setLoading(true)
    const res = await fetch('/api/exam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schoolName,
        title: examName,
        startDate,
        endDate,
        subjects: subjects
          .filter(s => s.subject.trim())
          .map(s => ({ ...s, date })),
      })
    })

    if (res.ok) {
      setOpen(false)
      router.refresh()
    } else {
      alert('저장에 실패했습니다.')
    }
    setLoading(false)
  }

  const inputStyle = {
    padding: '8px 12px',
    border: '0.5px solid var(--sage-border)',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none',
    color: 'var(--sage-text)',
    background: 'white',
    width: '100%',
  }

  const selectStyle = {
    padding: '8px 12px',
    border: '0.5px solid var(--sage-border)',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none',
    color: 'var(--sage-text)',
    background: 'white',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span
        onClick={handleClick}
        style={{
          background: open ? 'var(--sage-dark)' : 'var(--sage-lightest)',
          border: `0.5px solid ${open ? 'var(--sage-dark)' : 'var(--sage-border)'}`,
          borderRadius: '20px',
          padding: '6px 14px',
          fontSize: '13px',
          color: open ? 'white' : 'var(--sage-text)',
          cursor: 'pointer',
          display: 'inline-block',
          fontWeight: open ? '600' : '400',
          whiteSpace: 'nowrap',
        }}
      >
        {formattedDate} {open ? '▲' : '▼'}
      </span>

      {open && (
        <div style={{
          background: 'var(--sage-lightest)',
          border: '0.5px solid var(--sage-border)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <p style={{ color: 'var(--sage-text)', fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>
            {formattedDate} 시험 과목 등록
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {subjects.map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr 1fr 1fr', gap: '8px', alignItems: 'center' }}>
                <select
                  value={s.grade}
                  onChange={(e) => updateSubject(i, 'grade', Number(e.target.value))}
                  style={selectStyle}
                >
                  <option value={1}>1학년</option>
                  <option value={2}>2학년</option>
                  <option value={3}>3학년</option>
                </select>
                <select
                  value={s.period}
                  onChange={(e) => updateSubject(i, 'period', Number(e.target.value))}
                  style={selectStyle}
                >
                  <option value={1}>1교시</option>
                  <option value={2}>2교시</option>
                  <option value={3}>3교시</option>
                  <option value={4}>4교시</option>
                </select>
                <input
                  placeholder="과목명"
                  value={s.subject}
                  onChange={(e) => updateSubject(i, 'subject', e.target.value)}
                  style={inputStyle}
                />
                <input
                  placeholder="교재"
                  value={s.textbook}
                  onChange={(e) => updateSubject(i, 'textbook', e.target.value)}
                  style={inputStyle}
                />
                <input
                  placeholder="범위"
                  value={s.pages}
                  onChange={(e) => updateSubject(i, 'pages', e.target.value)}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={addSubject}
              style={{
                background: 'white',
                color: 'var(--sage-button)',
                border: '0.5px solid var(--sage-button)',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              + 행 추가
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: 'var(--sage-button)',
                color: 'white',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}