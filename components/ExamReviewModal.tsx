'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import ExamReviewPanel from '@/components/ExamReviewPanel'

type Props = {
  open: boolean
  onClose: () => void
  schoolId: number
  examTitle: string
  grade: number
  onSaved?: () => void
  onDeleted?: () => void
}

export default function ExamReviewModal({ open, onClose, schoolId, examTitle, grade, onSaved, onDeleted }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!mounted || !open) return null

  return createPortal(
    <div
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(17, 24, 39, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exam-review-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          maxHeight: 'min(92vh, 720px)',
          overflow: 'auto',
          background: 'var(--bg)',
          borderRadius: '16px',
          boxShadow: '0 24px 48px rgba(17, 24, 39, 0.18)',
          border: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '14px 16px',
            background: 'var(--bg)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <h2
            id="exam-review-modal-title"
            style={{
              margin: 0,
              fontSize: '17px',
              fontWeight: 800,
              letterSpacing: '-0.3px',
              color: 'var(--text)',
            }}
          >
            시험 후기
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            style={{
              flexShrink: 0,
              width: '36px',
              height: '36px',
              border: 'none',
              borderRadius: '10px',
              background: 'rgba(17, 24, 39, 0.05)',
              color: 'var(--text)',
              fontSize: '22px',
              lineHeight: 1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: '14px 16px 16px' }}>
          <ExamReviewPanel
            schoolId={schoolId}
            examTitle={examTitle}
            grade={grade}
            layout="sheet"
            onSaved={onSaved}
            onDeleted={onDeleted ?? onSaved}
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}
