'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'

type Props = {
  schoolId: number
  examTitle: string
  grade: number
}

type Review = {
  id: number
  difficulty: number
  grammarCount: number | null
  vocabCount: number | null
  readingCount: number | null
  writingCount: number | null
  listeningCount: number | null
  otherCount: number | null
  freeText: string | null
  createdAt: string
  updatedAt: string
}

export default function ExamReviewPanel({ schoolId, examTitle, grade }: Props) {
  const [loading, setLoading] = useState(true)
  const [mine, setMine] = useState<Review | null>(null)
  const [difficulty, setDifficulty] = useState(3)
  const [grammarCount, setGrammarCount] = useState<number | ''>('')
  const [vocabCount, setVocabCount] = useState<number | ''>('')
  const [readingCount, setReadingCount] = useState<number | ''>('')
  const [writingCount, setWritingCount] = useState<number | ''>('')
  const [listeningCount, setListeningCount] = useState<number | ''>('')
  const [otherCount, setOtherCount] = useState<number | ''>('')
  const [freeText, setFreeText] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(
      `/api/exam-reviews?schoolId=${schoolId}&examTitle=${encodeURIComponent(examTitle)}&grade=${grade}`,
    )
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        const m: Review | null = d.mine ?? null
        setMine(m)
        if (m) {
          setDifficulty(m.difficulty)
          setGrammarCount(m.grammarCount ?? '')
          setVocabCount(m.vocabCount ?? '')
          setReadingCount(m.readingCount ?? '')
          setWritingCount(m.writingCount ?? '')
          setListeningCount(m.listeningCount ?? '')
          setOtherCount(m.otherCount ?? '')
          setFreeText(m.freeText ?? '')
        }
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [schoolId, examTitle, grade])

  const inputStyle = {
    fontSize: '13px',
  }

  const StarRating = () => {
    return (
      <div className="ui-stars" role="radiogroup" aria-label="체감 난이도">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = difficulty >= n
          return (
            <button
              key={n}
              type="button"
              className={['ui-starBtn', active ? 'ui-starBtn-active' : ''].filter(Boolean).join(' ')}
              onClick={() => setDifficulty(n)}
              aria-label={`난이도 ${n}점`}
              aria-checked={difficulty === n}
              role="radio"
            >
              ★
            </button>
          )
        })}
        <span className="ui-meta" style={{ marginLeft: '6px' }}>
          {difficulty}/5
        </span>
      </div>
    )
  }

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/exam-reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schoolId,
        examTitle,
        grade,
        difficulty,
        grammarCount: grammarCount === '' ? null : grammarCount,
        vocabCount: vocabCount === '' ? null : vocabCount,
        readingCount: readingCount === '' ? null : readingCount,
        writingCount: writingCount === '' ? null : writingCount,
        listeningCount: listeningCount === '' ? null : listeningCount,
        otherCount: otherCount === '' ? null : otherCount,
        freeText,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(data?.error ?? '저장에 실패했습니다.')
      setSaving(false)
      return
    }
    alert(mine ? '후기가 수정되었습니다.' : '후기가 등록되었습니다.')
    setSaving(false)
  }

  if (loading) {
    return <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>후기를 불러오는 중...</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="ui-card" style={{ padding: '16px' }}>
        <p className="ui-title" style={{ margin: 0 }}>
          {mine ? '내 후기 수정' : '내 후기 작성'}
        </p>
        <p className="ui-meta" style={{ margin: '6px 0 0' }}>
          학년 {grade} · {examTitle}
        </p>
      </div>

      <div className="ui-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <p className="ui-subtitle" style={{ margin: 0, color: 'var(--text)' }}>
                체감 난이도
              </p>
              <span className="ui-meta">별을 눌러 선택</span>
            </div>
            <StarRating />
          </div>

          {(
            [
              ['문법', grammarCount, setGrammarCount],
              ['어휘', vocabCount, setVocabCount],
              ['독해', readingCount, setReadingCount],
              ['서술형', writingCount, setWritingCount],
              ['듣기', listeningCount, setListeningCount],
              ['기타', otherCount, setOtherCount],
            ] as const
          ).map(([label, val, setVal]) => (
            <label
              key={String(label)}
              style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--muted)' }}
            >
              {label} 문항수(대략)
              <input
                className="ui-input"
                type="number"
                min={0}
                value={val}
                onChange={(e) => setVal(e.target.value === '' ? '' : Number(e.target.value))}
                style={inputStyle}
              />
            </label>
          ))}
        </div>

        <label style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--muted)' }}>
          한줄/팁 (선택)
          <textarea
            className="ui-textarea"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            rows={4}
            style={inputStyle}
          />
        </label>

        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleSave} disabled={saving} variant="primary" size="md">
            {saving ? '저장 중...' : mine ? '수정 저장' : '저장'}
          </Button>
        </div>
      </div>
    </div>
  )
}

