'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

type School = {
  id: number
  name: string
  address?: string | null
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<School[]>([])
  const [show, setShow] = useState(false)
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 1) return
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data)
      setShow(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (school: School) => {
    setShow(false)
    setQuery(school.name)
    router.push(`/school/${school.id}`)
  }

  const handleSearch = async () => {
    if (!query.trim()) return
    setShow(false)
  
    if (results.length > 0) {
      router.push(`/school/${results[0].id}`)
      return
    }
  
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    const data = await res.json()
  
    if (data.length > 0) {
      router.push(`/school/${data[0].id}`)
    } else {
      alert('학교를 찾을 수 없습니다. 다시 검색해보세요.')
    }
  }

  return (
    <div style={{ width: '100%' }}>
      <div ref={ref} style={{ position: 'relative', display: 'flex', gap: '8px' }}>
        <input
          className="ui-input"
          type="text"
          value={query}
          onChange={(e) => {
            const next = e.target.value
            setQuery(next)
            if (next.length < 1) {
              setResults([])
              setShow(false)
            }
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="학교 이름을 입력하세요"
          style={{
            flex: 1,
            borderRadius: '14px',
            fontSize: '15px',
            boxShadow: 'var(--ui-shadow)',
          }}
        />
        <Button onClick={handleSearch} variant="primary" style={{ padding: '11px 18px', borderRadius: '14px', fontSize: '15px' }}>
          검색
        </Button>

        {show && results.length > 0 && (
          <ul style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: '72px',
            background: 'white',
            border: '1px solid var(--sage-border)',
            borderRadius: '14px',
            listStyle: 'none',
            padding: '4px 0',
            margin: 0,
            zIndex: 10,
            maxHeight: '288px',
            overflowY: 'auto',
            boxShadow: '0 10px 24px rgba(15, 20, 25, 0.12)',
          }}>
            {results.map((school) => (
              <li
                key={school.id}
                onClick={() => handleSelect(school)}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'var(--sage-text)',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontWeight: 600 }}>{school.name}</span>
                  {school.address && (
                    <span style={{ fontSize: '12px', color: 'var(--sage-muted)' }}>{school.address}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}