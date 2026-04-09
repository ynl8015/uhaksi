'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type Props = {
  schoolId: number
  examTitle: string
  grade: number
  /** 후기 저장·삭제 등 집계 갱신 후 다시 불러올 때 증가 */
  reloadKey?: number
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

export default function ExamAnalysisPanel({ schoolId, examTitle, grade, reloadKey = 0 }: Props) {
  const [loading, setLoading] = useState(true)
  const [agg, setAgg] = useState<Aggregate | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(
      `/api/exam-analysis?schoolId=${schoolId}&examTitle=${encodeURIComponent(examTitle)}&grade=${grade}`,
    )
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
  }, [schoolId, examTitle, grade, reloadKey])

  const difficultyData = useMemo(() => {
    const hist = asStatsShape(agg?.statsJson)?.difficulty?.histogram ?? null
    if (!hist) return []
    return ['1', '2', '3', '4', '5'].map((k) => ({ difficulty: k, count: hist[k] ?? 0 }))
  }, [agg])

  const countAvgs = useMemo(() => {
    const c = asStatsShape(agg?.statsJson)?.counts ?? null
    if (!c) return []
    const mcq = Number(c.mcq?.avg ?? c.grammar?.avg ?? 0)
    const subj = Number(c.subjective?.avg ?? c.writing?.avg ?? 0)
    return [
      { category: '객관식', avg: mcq },
      { category: '서술형', avg: subj },
    ]
  }, [agg])

  if (loading) {
    return <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>총평을 불러오는 중...</p>
  }

  if (!agg) {
    return (
      <p style={{ margin: 0, color: 'var(--muted)', fontSize: '13px' }}>
        아직 총평이 없어요. 후기가 충분히 쌓이면 자동으로 생성됩니다.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="ui-card" style={{ padding: '14px 14px' }}>
        <p className="ui-meta" style={{ margin: 0 }}>
          후기 {agg.sourceCount}개 기반 · {agg.aiGeneratedAt ? `업데이트: ${new Date(agg.aiGeneratedAt).toLocaleString()}` : '업데이트 없음'}
        </p>
        <p
          style={{
            margin: '10px 0 0',
            fontSize: '13px',
            lineHeight: 1.7,
            color: 'var(--text)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {agg.aiSummary ?? '요약을 생성하지 못했습니다. (후기 수가 부족하거나, 생성에 실패했을 수 있어요)'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        <div className="ui-card" style={{ padding: '12px' }}>
          <p className="ui-subtitle" style={{ margin: '0 0 10px', color: 'var(--text)' }}>
            난이도 분포
          </p>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={difficultyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="difficulty" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--accent)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ui-card" style={{ padding: '12px' }}>
          <p className="ui-subtitle" style={{ margin: '0 0 10px', color: 'var(--text)' }}>
            객관식·서술형 평균 문항수(자가보고)
          </p>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countAvgs} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="category" width={60} />
                <Tooltip />
                <Bar dataKey="avg" fill="rgba(255, 111, 15, 0.55)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

