'use client'

import type { CSSProperties } from 'react'

type Props = {
  children: string
  style?: CSSProperties
  tone?: 'accent' | 'neutral'
}

export default function Badge({ children, tone = 'neutral', style }: Props) {
  const s: CSSProperties =
    tone === 'accent'
      ? { border: '1px solid var(--accent-border)', background: 'var(--accent-soft)', color: '#b54708' }
      : { border: '1px solid var(--border)', background: 'rgba(17, 24, 39, 0.03)', color: 'var(--text)' }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 10px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 800,
        letterSpacing: '-0.2px',
        lineHeight: 1,
        ...s,
        ...style,
      }}
    >
      {children}
    </span>
  )
}

