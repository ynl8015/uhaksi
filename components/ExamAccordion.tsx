'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import Badge from '@/components/ui/Badge'
import ExamFriendsSummary from '@/components/ExamFriendsSummary'
import ExamReviewPanel from '@/components/ExamReviewPanel'

type ExamPeriod = {
  name: string
  dates: string[]
  startDate: string
  endDate: string
}

type Props = {
  exam: ExamPeriod
  schoolId: number
  schoolName: string
  defaultOpen?: boolean
  existingExam?: {
    id: number
    title: string
    startDate: string | Date
    endDate: string | Date
    subjects: Array<{
      id: number
      subject: string
      grade: number | null
      period: number | null
      date: string | null
    }>
    subjectRanges: Array<{
      id: number
      grade?: number | null
      subject: string
      label?: string | null
      content?: string | null
      sortOrder?: number | null
    }>
  } | null
}

function formatDate(yyyymmdd: string) {
  const month = parseInt(yyyymmdd.slice(4, 6))
  const day = parseInt(yyyymmdd.slice(6, 8))
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const date = new Date(parseInt(yyyymmdd.slice(0, 4)), month - 1, day)
  return `${month}/${day} (${weekdays[date.getDay()]})`
}

const GRADES = [1, 2, 3]
const PERIODS = [1, 2, 3, 4]

type TableState = Record<number, Record<string, Record<number, string>>>

function initTable(dates: string[]): TableState {
  const init: TableState = {}
  GRADES.forEach(g => {
    init[g] = {}
    dates.forEach(d => {
      init[g][d] = {}
      PERIODS.forEach(p => { init[g][d][p] = '' })
    })
  })
  return init
}

export default function ExamAccordion({ exam, schoolId, existingExam, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedGrade, setSelectedGrade] = useState<1 | 2 | 3>(1)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [table, setTable] = useState<TableState>(() => initTable(exam.dates))
  const [ranges, setRanges] = useState<Record<number, Record<string, Array<{ label: string; content: string }>>>>({})
  const [loading, setLoading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const readOnly = !!existingExam && !editing
  const showInputs = !!session && editing

  const resetFromExisting = () => {
    const newTable = initTable(exam.dates)
    existingExam?.subjects?.forEach((s) => {
      if (!s.date || !s.grade || !s.period) return
      if (newTable[s.grade]?.[s.date]?.[s.period] !== undefined) {
        newTable[s.grade][s.date][s.period] = s.subject
      }
    })
    setTable(newTable)

    const nextRanges: Record<number, Record<string, Array<{ label: string; content: string }>>> = {}
    existingExam?.subjectRanges?.forEach((r) => {
      const g = typeof r.grade === 'number' ? r.grade : 0
      if (!nextRanges[g]) nextRanges[g] = {}
      if (!nextRanges[g][r.subject]) nextRanges[g][r.subject] = []
      nextRanges[g][r.subject].push({ label: r.label ?? '', content: r.content ?? '' })
    })
    setRanges(nextRanges)
  }

  const resetToEmpty = () => {
    setTable(initTable(exam.dates))
    setRanges({})
  }

  useEffect(() => {
    if (!existingExam) return

    resetFromExisting()
    setEditing(false)
    setShowReview(false)
    setOpen(defaultOpen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingExam, exam.dates, defaultOpen])

  const handleChange = (grade: number, date: string, period: number, value: string) => {
    setTable(prev => ({
      ...prev,
      [grade]: {
        ...prev[grade],
        [date]: {
          ...prev[grade][date],
          [period]: value,
        }
      }
    }))
  }

  const subjectsFromTable = (grade: number) => {
    const set = new Set<string>()
    exam.dates.forEach((d) => {
      PERIODS.forEach((p) => {
        const v = table[grade]?.[d]?.[p]
        if (v && v.trim()) set.add(v.trim())
      })
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ko'))
  }

  useEffect(() => {
    const list = subjectsFromTable(selectedGrade)
    setSelectedSubject(list[0] ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGrade])

  const handleImageUpload = async (file: File) => {
    if (existingExam && !editing) {
      const ok = window.confirm('이미 등록된 시험입니다. 내용을 수정할까요?')
      if (!ok) return
      setEditing(true)
    }
    if (!existingExam && !editing) {
      setEditing(true)
    }

    setParsing(true)
    const formData = new FormData()
    formData.append('image', file)
    formData.append('dates', JSON.stringify(exam.dates))
  
    const res = await fetch('/api/parse-exam', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()

    if (!res.ok) {
      alert(data?.error ?? '인식 서버가 혼잡합니다. 잠시 후 다시 시도해주세요.')
      setParsing(false)
      return
    }
  
    if (data.subjects) {
      const newTable = initTable(exam.dates)
      data.subjects.forEach((s: { grade: number; period: number; date: string; subject: string }) => {
        if (newTable[s.grade]?.[s.date]?.[s.period] !== undefined) {
          newTable[s.grade][s.date][s.period] = s.subject
        }
      })
      setTable(newTable)
    } else {
      alert('인식에 실패했습니다. 다시 시도해주세요.')
    }
    setParsing(false)
  }

  const handleSubmit = async () => {
    if (!session) {
      router.push('/login')
      return
    }

    const ok = window.confirm(existingExam ? '수정 내용을 저장할까요?' : '시험 정보를 등록할까요?')
    if (!ok) return

    const subjects: { grade: number; period: number; date: string; subject: string }[] = []
    GRADES.forEach(grade => {
      exam.dates.forEach(date => {
        PERIODS.forEach(period => {
          const subject = table[grade][date][period]
          if (subject.trim()) {
            subjects.push({ grade, period, date, subject })
          }
        })
      })
    })

    if (subjects.length === 0) {
      alert('과목을 입력해주세요.')
      return
    }

    setLoading(true)
    const res = await fetch('/api/exam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schoolId,
        title: exam.name,
        startDate: exam.startDate,
        endDate: exam.endDate,
        subjects,
        subjectRanges: GRADES.flatMap((g) =>
          subjectsFromTable(g).flatMap((s) =>
            (ranges[g]?.[s] ?? []).map((item, idx) => ({
              grade: g,
              subject: s,
              label: item.label,
              content: item.content,
              sortOrder: idx,
            }))
          )
        ),
      })
    })

    if (res.ok) {
      router.refresh()
      setOpen(false)
      setEditing(false)
    } else {
      alert('저장에 실패했습니다.')
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!session) {
      router.push('/login')
      return
    }
    if (!existingExam) return

    const ok = window.confirm('정말 삭제할까요? 삭제하면 복구할 수 없습니다.')
    if (!ok) return

    setLoading(true)
    const res = await fetch('/api/exam', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examId: existingExam.id }),
    })
    const data = await res.json().catch(() => ({}))

    if (res.ok) {
      resetToEmpty()
      setEditing(false)
      setOpen(false)
      router.refresh()
    } else {
      alert(data?.error ?? '삭제에 실패했습니다.')
    }
    setLoading(false)
  }

  const handleCancelEdit = () => {
    if (existingExam) {
      resetFromExisting()
    } else {
      resetToEmpty()
    }
    setEditing(false)
  }

  const inputStyle = {
    fontSize: '12px',
    textAlign: 'center' as const,
    minWidth: '0px',
  }

  return (
    <div className="ui-card" style={{ overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          background: 'transparent',
          padding: '14px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span className="ui-subtitle" style={{ color: 'var(--text)' }}>{exam.name}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {existingExam && (
            <Badge tone="accent">등록됨</Badge>
          )}
          <span className="ui-meta" style={{ color: 'var(--muted)', fontSize: '13px' }}>
            {formatDate(exam.startDate)} ~ {formatDate(exam.endDate)}
          </span>
          <span style={{ color: 'var(--muted)', fontSize: '12px' }}>
            {open ? '▲' : '▼'}
          </span>
        </div>
      </button>

      {open && (
        <div style={{ padding: '16px', background: 'transparent', borderTop: '1px solid var(--border)' }}>
          <>
          {session && (
            <div style={{ marginBottom: '14px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file)
                }}
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={parsing || (!editing && !!existingExam)}
                variant="secondary"
                size="sm"
              >
                {parsing ? '인식 중...' : '📷 통지문 사진으로 자동 입력'}
              </Button>
              {!existingExam && !editing && (
                <Button type="button" onClick={() => setEditing(true)} variant="secondary" size="sm">
                  입력 시작
                </Button>
              )}
              {existingExam && !editing && (
                <>
                  <Button type="button" onClick={() => setEditing(true)} variant="secondary" size="sm">
                    수정하기
                  </Button>
                  <Button type="button" onClick={handleDelete} variant="danger" size="sm">
                    삭제하기
                  </Button>
                </>
              )}
              {editing && (
                <Button type="button" onClick={handleCancelEdit} disabled={loading || parsing} variant="secondary" size="sm">
                  취소
                </Button>
              )}
              {parsing && (
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>
                  AI가 시험표를 읽고 있어요...
                </span>
              )}
            </div>
          )}

          {!session && (
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '12px' }}>
              로그인 후 시험 과목을 등록할 수 있어요.
            </p>
          )}

          <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {GRADES.map((g) => (
              <Chip
                key={g}
                label={`${g}학년`}
                selected={selectedGrade === g}
                variant="tab"
                onClick={() => setSelectedGrade(g as 1 | 2 | 3)}
              />
            ))}
          </div>

          <div className="ui-card" style={{ marginBottom: '16px', borderRadius: '14px', overflow: 'hidden' }}>
            <table className="ui-table">
              <thead>
                <tr>
                  <th style={{ width: '64px', textAlign: 'center' }}>교시</th>
                  {exam.dates.map((d) => (
                    <th key={d} style={{ textAlign: 'center' }}>
                      {formatDate(d)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((p) => (
                  <tr key={p}>
                    <td style={{ width: '64px', textAlign: 'center', fontWeight: 900, fontSize: '12px' }}>{p}교시</td>
                    {exam.dates.map((d) => (
                      <td key={d}>
                        {!showInputs ? (
                          <div className="ui-cellText" title={table[selectedGrade][d][p] || '-'}>
                            {table[selectedGrade][d][p] || <span className="ui-cellText-muted">-</span>}
                          </div>
                        ) : (
                          <input
                            className="ui-input ui-pill-input"
                            value={table[selectedGrade][d][p]}
                            onChange={(e) => handleChange(selectedGrade, d, p, e.target.value)}
                            placeholder="-"
                            disabled={!session}
                            style={{
                              ...inputStyle,
                              textAlign: 'left' as const,
                              fontSize: '12px',
                            }}
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {session && (
            <div style={{ marginBottom: '16px' }}>
              <div className="ui-divider" style={{ margin: '4px 0 16px' }} />
              <p className="ui-subtitle" style={{ margin: '0 0 10px', color: 'var(--text)' }}>
                과목별 시험범위
              </p>
              <div className="ui-stack">
                {subjectsFromTable(selectedGrade).length === 0 ? (
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>
                    먼저 위 표에 과목을 입력하거나 사진 인식을 해주세요.
                  </p>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {subjectsFromTable(selectedGrade).map((subj) => (
                        <Chip
                          key={subj}
                          label={subj}
                          selected={selectedSubject === subj}
                          onClick={() => setSelectedSubject(subj)}
                        />
                      ))}
                    </div>

                    {selectedSubject && (
                      <div className="ui-card" style={{ padding: '14px' }}>
                        <p className="ui-title" style={{ margin: '0 0 10px' }}>
                          {selectedSubject}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {(ranges[selectedGrade]?.[selectedSubject] ?? []).length === 0 && readOnly && (
                            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>
                              등록된 시험범위가 없습니다.
                            </p>
                          )}

                          {(ranges[selectedGrade]?.[selectedSubject] ?? []).map((item, idx) => {
                            if (readOnly) {
                              return (
                                <div key={idx}>
                                  {idx > 0 && <div className="ui-divider" style={{ margin: '10px 0' }} />}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <Badge tone="accent">{item.label?.trim() ? item.label : '범위'}</Badge>
                                    <span className="ui-meta">{selectedGrade}학년</span>
                                  </div>
                                  <p
                                    style={{
                                      margin: 0,
                                      fontSize: '14px',
                                      color: 'var(--text)',
                                      lineHeight: 1.7,
                                      whiteSpace: 'pre-wrap',
                                      fontWeight: 700,
                                    }}
                                  >
                                    {item.content?.trim() ? item.content : '-'}
                                  </p>
                                </div>
                              )
                            }

                            return (
                              <div
                                key={idx}
                                style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: '8px', alignItems: 'start' }}
                              >
                                <input
                                  className="ui-input"
                                  value={item.label}
                                  onChange={(e) => {
                                    const v = e.target.value
                                    setRanges((prev) => {
                                      const gradeMap = { ...(prev[selectedGrade] ?? {}) }
                                      const list = [...(gradeMap[selectedSubject] ?? [])]
                                      list[idx] = { ...list[idx], label: v }
                                      gradeMap[selectedSubject] = list
                                      return { ...prev, [selectedGrade]: gradeMap }
                                    })
                                  }}
                                  placeholder="구분(예: 교과서)"
                                  style={{ ...inputStyle, textAlign: 'left' as const, borderRadius: '10px' }}
                                />
                                <textarea
                                  className="ui-textarea"
                                  value={item.content}
                                  onChange={(e) => {
                                    const v = e.target.value
                                    setRanges((prev) => {
                                      const gradeMap = { ...(prev[selectedGrade] ?? {}) }
                                      const list = [...(gradeMap[selectedSubject] ?? [])]
                                      list[idx] = { ...list[idx], content: v }
                                      gradeMap[selectedSubject] = list
                                      return { ...prev, [selectedGrade]: gradeMap }
                                    })
                                  }}
                                  placeholder="범위 내용을 입력하세요 (여러 줄 가능)"
                                  rows={2}
                                  style={{
                                    width: '100%',
                                    fontSize: '12px',
                                    borderRadius: '10px',
                                  }}
                                />
                                <Button
                                  type="button"
                                  onClick={() => {
                                    setRanges((prev) => {
                                      const gradeMap = { ...(prev[selectedGrade] ?? {}) }
                                      const list = [...(gradeMap[selectedSubject] ?? [])]
                                      list.splice(idx, 1)
                                      gradeMap[selectedSubject] = list
                                      return { ...prev, [selectedGrade]: gradeMap }
                                    })
                                  }}
                                  variant="secondary"
                                  style={{ padding: '8px 10px', fontSize: '12px' }}
                                >
                                  삭제
                                </Button>
                              </div>
                            )
                          })}

                          <div>
                            <Button
                              type="button"
                              onClick={() => {
                                setRanges((prev) => {
                                  const gradeMap = { ...(prev[selectedGrade] ?? {}) }
                                  const list = [...(gradeMap[selectedSubject] ?? [])]
                                  list.push({ label: '', content: '' })
                                  gradeMap[selectedSubject] = list
                                  return { ...prev, [selectedGrade]: gradeMap }
                                })
                              }}
                              variant="secondary"
                              style={{
                                opacity: readOnly ? 0.0 : 1,
                                height: readOnly ? 0 : undefined,
                                paddingTop: readOnly ? 0 : undefined,
                                paddingBottom: readOnly ? 0 : undefined,
                                borderWidth: readOnly ? 0 : undefined,
                              }}
                              disabled={readOnly}
                            >
                              + 범위 항목 추가
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {session && (
            <div style={{ marginBottom: '16px' }}>
              <div className="ui-divider" style={{ margin: '4px 0 16px' }} />
              <ExamFriendsSummary schoolId={schoolId} examTitle={exam.name} grade={selectedGrade} />

              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="button"
                  variant={showReview ? 'secondary' : 'primary'}
                  size="md"
                  onClick={() => setShowReview((v) => !v)}
                >
                  {showReview ? '작성 닫기' : '내 후기 남기기'}
                </Button>
              </div>

              {showReview && (
                <div style={{ marginTop: '12px' }}>
                  <ExamReviewPanel schoolId={schoolId} examTitle={exam.name} grade={selectedGrade} />
                </div>
              )}
            </div>
          )}

          {session && editing && (
            <Button onClick={handleSubmit} disabled={loading || parsing} variant="primary">
              {loading ? '저장 중...' : existingExam ? '수정 저장' : '저장'}
            </Button>
          )}
          </>
        </div>
      )}
    </div>
  )
}