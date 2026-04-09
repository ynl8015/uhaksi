type IconProps = {
  size?: number
  className?: string
}

const stroke = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function IconCamera({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden style={{ display: 'block' }} {...stroke}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

export function IconPencil({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden style={{ display: 'block' }} {...stroke}>
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}

export function IconTrash({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden style={{ display: 'block' }} {...stroke}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" />
    </svg>
  )
}

export function IconBot({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden style={{ display: 'block' }} {...stroke}>
      <path d="M8 9V7a4 4 0 0 1 8 0v2" />
      <rect x="4" y="9" width="16" height="11" rx="2.5" />
      <circle cx="9.5" cy="14.5" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="14.5" r="1.25" fill="currentColor" stroke="none" />
      <path d="M10 17.5h4" />
    </svg>
  )
}
