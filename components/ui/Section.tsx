'use client'

import type { CSSProperties, ReactNode } from 'react'

type Props = {
  children: ReactNode
  maxWidth?: number
  style?: CSSProperties
}

export default function Section({ children, maxWidth = 720, style }: Props) {
  return (
    <section style={{ maxWidth: `${maxWidth}px`, margin: '0 auto', padding: '0 24px', ...style }}>
      {children}
    </section>
  )
}

