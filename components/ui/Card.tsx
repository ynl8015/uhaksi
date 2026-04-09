'use client'

import type { CSSProperties, ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  style?: CSSProperties
  pastel?: 'blue' | 'yellow' | 'purple' | 'mint' | 'pink'
}

export default function Card({ children, className, style, pastel }: Props) {
  const bg =
    pastel === 'blue'
      ? 'var(--pastel-blue)'
      : pastel === 'yellow'
        ? 'var(--pastel-yellow)'
        : pastel === 'purple'
          ? 'var(--pastel-purple)'
          : pastel === 'mint'
            ? 'var(--pastel-mint)'
            : pastel === 'pink'
              ? 'var(--pastel-pink)'
              : null

  return (
    <div className={['ui-card', className].filter(Boolean).join(' ')} style={{ ...(bg ? { background: bg } : null), ...style }}>
      {children}
    </div>
  )
}

