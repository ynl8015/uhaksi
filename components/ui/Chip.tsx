'use client'

import type { CSSProperties } from 'react'

type Props = {
  label: string
  selected: boolean
  onClick: () => void
  variant?: 'filter' | 'tab'
  style?: CSSProperties
}

export default function Chip({ label, selected, onClick, variant = 'filter', style }: Props) {
  const base = variant === 'tab' ? 'ui-chip ui-chip-button ui-chip-tab' : 'ui-chip ui-chip-button'
  return (
    <button
      type="button"
      onClick={onClick}
      className={[base, selected ? 'ui-chip-active' : ''].filter(Boolean).join(' ')}
      style={style}
    >
      {label}
    </button>
  )
}

