'use client'

import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'ghostDanger'
type Size = 'sm' | 'md' | 'lg'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
}

export default function Button({ variant = 'primary', size = 'md', fullWidth = false, className, style, ...props }: Props) {
  const v =
    variant === 'primary'
      ? 'ui-button ui-button-primary'
      : variant === 'secondary'
        ? 'ui-button ui-button-secondary'
        : variant === 'danger'
          ? 'ui-button ui-button-danger'
          : variant === 'ghostDanger'
            ? 'ui-button ui-button-ghost ui-button-ghost-danger'
            : 'ui-button ui-button-ghost'

  const s = size === 'sm' ? { padding: '9px 12px', fontSize: '12px', borderRadius: '12px' }
    : size === 'lg' ? { padding: '13px 18px', fontSize: '15px', borderRadius: '16px' }
    : {}

  return (
    <button
      {...props}
      className={[v, className].filter(Boolean).join(' ')}
      style={{ ...(fullWidth ? { width: '100%' } : null), ...s, ...style }}
    />
  )
}

