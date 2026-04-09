'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from 'react'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'

type Props = {
  schoolId: number
  examTitle: string
  grade: number
}

type Aggregate = {
  sourceCount: number
  statsJson: unknown
  aiSummary: string | null
  aiGeneratedAt: string | null
}

type StatsShape = {
  difficulty?: { histogram?: Record<string, number> }
  counts?: Record<string, { avg?: number | null }>
}

function asStatsShape(v: unknown): StatsShape {
  if (typeof v !== 'object' || v === null) return {}
  return v as StatsShape
}

function starString(avg: number): string {
  const clamped = Math.max(1, Math.min(5, avg))
  const filled = Math.round(clamped)
  return '★★★★★'.slice(0, filled) + '☆☆☆☆☆'.slice(0, 5 - filled)
}

function firstLine(v: string | null): string | null {
  if (!v) return null
  const line = v.split('\n').map((s) => s.trim()).find(Boolean) ?? null
  if (!line) return null
  // 너무 길면 한 줄 총평 느낌으로 컷
  return line.length > 90 ? `${line.slice(0, 90)}…` : line
}

export default function ExamFriendsSummary({ schoolId, examTitle, grade }: Props) {
  const [loading, setLoading] = useState(true)
  const [agg, setAgg] = useState<Aggregate | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/exam-analysis?schoolId=${schoolId}&examTitle=${encodeURIComponent(examTitle)}&grade=${grade}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        setAgg(d.aggregate ?? null)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [schoolId, examTitle, grade])

  const computed = useMemo(() => {
    const stats = asStatsShape(agg?.statsJson)
    const hist = stats.difficulty?.histogram ?? null
    let avgDifficulty = 0
    if (hist) {
      let sum = 0
      let count = 0
      for (const k of ['1', '2', '3', '4', '5']) {
        const n = Number(hist[k] ?? 0)
        sum += Number(k) * n
        count += n
      }
      avgDifficulty = count > 0 ? sum / count : 0
    }
    const counts = stats.counts ?? {}
    const g = Number(counts.grammar?.avg ?? 0)
    const v = Number(counts.vocab?.avg ?? 0)
    const r = Number(counts.reading?.avg ?? 0)
    const w = Number(counts.writing?.avg ?? 0)
    const l = Number(counts.listening?.avg ?? 0)
    const o = Number(counts.other?.avg ?? 0)

    return {
      avgDifficulty,
      star: avgDifficulty ? starString(avgDifficulty) : null,
      oneLine: firstLine(agg?.aiSummary ?? null),
      counts: { g, v, r, w, l, o },
    }
  }, [agg])

  if (loading) {
    return <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>친구들 평가를 불러오는 중...</p>
  }

  if (!agg) {
    return (
      <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>
        아직 친구들 평가가 없어요. 후기가 쌓이면 자동으로 요약이 생성됩니다.
      </p>
    )
  }

  return (
    <Card pastel="mint" style={{ padding: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Badge tone="accent">친구들 평가는 이래요</Badge>
          <span className="ui-meta">후기 {agg.sourceCount}개 기반</span>
        </div>
        {computed.star && (
          <span style={{ fontSize: '14px', fontWeight: 1000, letterSpacing: '-0.2px', color: 'var(--text)' }}>
            체감난이도 {computed.star}
          </span>
        )}
      </div>

      <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {[
          ['문법', computed.counts.g],
          ['어휘', computed.counts.v],
          ['독해', computed.counts.r],
          ['서술형', computed.counts.w],
          ['듣기', computed.counts.l],
          ['기타', computed.counts.o],
        ].map(([label, val]) => (
          <div
            key={String(label)}
            style={{
              padding: '10px 12px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.55)',
              border: '1px solid rgba(17, 24, 39, 0.08)',
            }}
          >
            <div className="ui-meta" style={{ marginBottom: '6px' }}>
              {label}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 1000, color: 'var(--text)', letterSpacing: '-0.3px' }}>
              {Number.isFinite(val) ? Math.round(Number(val)) : 0}문항
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '12px' }}>
        <div className="ui-meta" style={{ marginBottom: '6px' }}>AI 한줄총평</div>
        <div style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text)', fontWeight: 800 }}>
          {computed.oneLine ?? '요약을 생성하지 못했습니다. (후기 수가 부족하거나 생성에 실패했을 수 있어요)'}
        </div>
      </div>
    </Card>
  )
}

