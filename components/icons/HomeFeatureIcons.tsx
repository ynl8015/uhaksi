'use client'

type IconProps = {
  size?: number
  className?: string
}

const stroke = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function IconRange({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden style={{ display: 'block' }} {...stroke}>
      <path d="M8 7h10" />
      <path d="M8 12h10" />
      <path d="M8 17h7" />
      <path d="M5.2 7.2l.9.9 1.8-1.9" />
      <path d="M5.2 12.2l.9.9 1.8-1.9" />
      <path d="M5.2 17.2l.9.9 1.8-1.9" />
    </svg>
  )
}

export function IconPattern({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden style={{ display: 'block' }} {...stroke}>
      <path d="M4.5 18.5V6.5" />
      <path d="M4.5 18.5h15" />
      <path d="M8 15l3-3 2.5 2.5L18.5 9" />
      <path d="M18.5 9v4.2" />
    </svg>
  )
}

export function IconReview({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden style={{ display: 'block' }} {...stroke}>
      <path d="M12 3.2l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 8.4l5-.7L12 3.2z" />
      <path d="M7.5 20.2h9" />
    </svg>
  )
}

