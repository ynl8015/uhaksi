'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, type CSSProperties } from 'react'
import Button from '@/components/ui/Button'

type Props = {
  schoolId: number
  examTitle: string
  grade: number
  /** 저장 성공 시 (모달 닫기·목록 갱신 등) */
  onSaved?: () => void
  /** 삭제 성공 시 (집계 갱신 등). 없으면 로컬 폼만 초기화 */
  onDeleted?: () => void
  /** sheet: 모달용 구분선 위주 레이아웃 */
  layout?: 'inline' | 'sheet'
}

type Review = {
  id: number
  difficulty: number
  grammarCount: number | null
  writingCount: number | null
  freeText: string | null
  createdAt: string
  updatedAt: string
}

export default function ExamReviewPanel({ schoolId, examTitle, grade, onSaved, onDeleted, layout = 'inline' }: Props) {
  const [loading, setLoading] = useState(true)
  const [mine, setMine] = useState<Review | null>(null)
  const [difficulty, setDifficulty] = useState(3)
  const [mcqCount, setMcqCount] = useState<number | ''>('')
  const [subjectiveCount, setSubjectiveCount] = useState<number | ''>('')
  const [freeText, setFreeText] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const sheet = layout === 'sheet'

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
          setMcqCount(m.grammarCount ?? '')
          setSubjectiveCount(m.writingCount ?? '')
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

  const qaBadge = (letter: string) => (
    <span
      aria-hidden
      style={{
        flexShrink: 0,
        width: '20px',
        height: '20px',
        borderRadius: '6px',
        background: 'rgba(17, 24, 39, 0.06)',
        color: 'var(--muted)',
        fontSize: '11px',
        fontWeight: 800,
        lineHeight: '20px',
        textAlign: 'center',
      }}
    >
      {letter}
    </span>
  )

  const qaPairStyle = {
    display: 'grid' as const,
    gridTemplateColumns: 'auto 1fr',
    columnGap: '10px',
    rowGap: '6px',
    alignItems: 'start' as const,
  }

  const qaTextQ = { fontSize: '12px', lineHeight: 1.45, fontWeight: 600, color: 'var(--muted)' }
  const qaTextA: CSSProperties = {
    fontSize: '12px',
    lineHeight: 1.55,
    fontWeight: 500,
    color: 'var(--muted)',
  }

  const reviewInfoNote = (
    <div
      role="note"
      style={{
        margin: '0 0 12px',
        padding: '8px 10px',
        background: 'rgba(243, 244, 246, 0.85)',
        borderRadius: '10px',
        border: '1px solid var(--border)',
      }}
    >
      <div style={qaPairStyle}>
        {qaBadge('Q')}
        <span style={qaTextQ}>익명이 보장되나요?</span>
        {qaBadge('A')}
        <span style={qaTextA}>
          네. 내가 쓴 글은 남에게 그대로{' '}
          <span style={{ whiteSpace: 'nowrap' }}>보이지 않아요.</span> 평균·분포·AI 총평처럼 모아서만 반영돼요.
        </span>
      </div>
    </div>
  )

  const StarRating = () => {
    return (
      <div className="ui-stars ui-stars-plain" role="radiogroup" aria-label="체감 난이도">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = difficulty >= n
          return (
            <button
              key={n}
              type="button"
              className={['ui-starBtn ui-starBtn-plain', active ? 'ui-starBtn-active' : ''].filter(Boolean).join(' ')}
              onClick={() => setDifficulty(n)}
              aria-label={`난이도 ${n}점`}
              aria-checked={difficulty === n}
              role="radio"
            >
              ★
            </button>
          )
        })}
        <span className="ui-meta" style={{ marginLeft: '4px', fontWeight: 600 }}>
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
        mcqCount: mcqCount === '' ? null : mcqCount,
        subjectiveCount: subjectiveCount === '' ? null : subjectiveCount,
        freeText,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(data?.error ?? '저장에 실패했습니다.')
      setSaving(false)
      return
    }
    setSaving(false)
    if (onSaved) {
      onSaved()
    } else {
      alert(mine ? '후기가 수정되었습니다.' : '후기가 등록되었습니다.')
    }
  }

  const handleDelete = async () => {
    if (!mine) return
    if (!window.confirm('이 후기를 삭제할까요? 삭제하면 다시 작성할 수 있어요.')) return
    setDeleting(true)
    const res = await fetch(`/api/exam-reviews/${mine.id}`, { method: 'DELETE' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      alert(data?.error ?? '삭제에 실패했습니다.')
      setDeleting(false)
      return
    }
    setMine(null)
    setDifficulty(3)
    setMcqCount('')
    setSubjectiveCount('')
    setFreeText('')
    setDeleting(false)
    onDeleted?.()
  }

  if (loading) {
    return <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>불러오는 중…</p>
  }

  if (sheet) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '10px',
            marginBottom: '12px',
          }}
        >
          <p className="ui-meta" style={{ margin: 0, fontSize: '13px', flex: 1, minWidth: 0, lineHeight: 1.45 }}>
            {grade}학년 · {examTitle}
            <span style={{ marginLeft: '8px', color: 'var(--text)', fontWeight: 700 }}>
              {mine ? '수정' : '작성'}
            </span>
          </p>
          {mine ? (
            <Button
              type="button"
              variant="ghostDanger"
              size="sm"
              onClick={handleDelete}
              disabled={deleting || saving}
              style={{ flexShrink: 0, marginTop: '-2px' }}
            >
              {deleting ? '삭제 중…' : '삭제'}
            </Button>
          ) : null}
        </div>

        {reviewInfoNote}

        <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
            <p className="ui-subtitle" style={{ margin: 0, color: 'var(--text)' }}>
              체감 난이도
            </p>
            <span className="ui-meta" style={{ fontWeight: 600 }}>
              1~5점
            </span>
          </div>
          <StarRating />
        </div>

        <div
          style={{
            paddingTop: '12px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px 12px',
            alignItems: 'end',
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
            객관식(대략)
            <input
              className="ui-input ui-input-compact"
              type="number"
              min={0}
              value={mcqCount}
              onChange={(e) => setMcqCount(e.target.value === '' ? '' : Number(e.target.value))}
              style={inputStyle}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
            서술형(대략)
            <input
              className="ui-input ui-input-compact"
              type="number"
              min={0}
              value={subjectiveCount}
              onChange={(e) => setSubjectiveCount(e.target.value === '' ? '' : Number(e.target.value))}
              style={inputStyle}
            />
          </label>
        </div>

        <div style={{ paddingTop: '12px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
            자유 후기·팁 (선택)
            <textarea
              className="ui-textarea"
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              rows={3}
              placeholder="난이도·지문·시간·팁 등"
              style={{ ...inputStyle, padding: '8px 10px', minHeight: '72px' }}
            />
          </label>
        </div>

        <div style={{ marginTop: '14px' }}>
          <Button onClick={handleSave} disabled={saving || deleting} variant="primary" size="md" fullWidth>
            {saving ? '저장 중…' : mine ? '수정 저장' : '등록'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
        <p className="ui-title" style={{ margin: 0, flex: 1 }}>
          {mine ? '내 후기 수정' : '내 후기 작성'}
        </p>
        {mine ? (
          <Button type="button" variant="ghostDanger" size="sm" onClick={handleDelete} disabled={deleting || saving}>
            {deleting ? '삭제 중…' : '삭제'}
          </Button>
        ) : null}
      </div>
      <p className="ui-meta" style={{ margin: '0 0 14px' }}>
        학년 {grade} · {examTitle}
      </p>

      {reviewInfoNote}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <p className="ui-subtitle" style={{ margin: 0, color: 'var(--text)' }}>
              체감 난이도
            </p>
            <span className="ui-meta">1~5점</span>
          </div>
          <StarRating />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'end' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
            객관식(대략)
            <input
              className="ui-input ui-input-compact"
              type="number"
              min={0}
              value={mcqCount}
              onChange={(e) => setMcqCount(e.target.value === '' ? '' : Number(e.target.value))}
              style={inputStyle}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
            서술형(대략)
            <input
              className="ui-input ui-input-compact"
              type="number"
              min={0}
              value={subjectiveCount}
              onChange={(e) => setSubjectiveCount(e.target.value === '' ? '' : Number(e.target.value))}
              style={inputStyle}
            />
          </label>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
          자유 후기·팁 (선택)
          <textarea
            className="ui-textarea"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            rows={3}
            placeholder="난이도·지문·시간·팁 등"
            style={{ ...inputStyle, padding: '8px 10px', minHeight: '72px' }}
          />
        </label>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleSave} disabled={saving || deleting} variant="primary" size="md">
            {saving ? '저장 중...' : mine ? '수정 저장' : '저장'}
          </Button>
        </div>
      </div>
    </div>
  )
}
