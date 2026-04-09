const DATA_URL_RE = /^data:(image\/(?:jpeg|png|webp));base64,([\s\S]+)$/i

export function parseDataUrlImage(dataUrl: string): {
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp'
  base64: string
} | null {
  const m = dataUrl.trim().match(DATA_URL_RE)
  if (!m) return null
  const mime = m[1].toLowerCase()
  if (mime !== 'image/jpeg' && mime !== 'image/png' && mime !== 'image/webp') return null
  return { mediaType: mime, base64: m[2] }
}
