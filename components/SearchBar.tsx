'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

type School = {
  name: string
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<School[]>([])
  const [show, setShow] = useState(false)
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 1) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data)
      setShow(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (name: string) => {
    setShow(false)
    setQuery(name)
    router.push(`/school/${encodeURIComponent(name)}`)
  }

  const handleSearch = async () => {
    if (!query.trim()) return
    setShow(false)
  
    if (results.length > 0) {
      router.push(`/school/${encodeURIComponent(results[0].name)}`)
      return
    }
  
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    const data = await res.json()
  
    if (data.length > 0) {
      router.push(`/school/${encodeURIComponent(data[0].name)}`)
    } else {
      alert('학교를 찾을 수 없습니다. 다시 검색해보세요.')
    }
  }

  return (
    <div style={{ width: '100%' }}>
      <div ref={ref} style={{ position: 'relative', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="학교 이름을 입력하세요"
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1.5px solid #1e3d2a',
            borderRadius: '8px',
            fontSize: '15px',
            background: 'white',
            outline: 'none',
            color: '#1e3d2a',
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            background: 'var(--sage-button)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '500',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          검색
        </button>

        {show && results.length > 0 && (
          <ul style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: '72px',
            background: 'white',
            border: '1px solid var(--sage-border)',
            borderRadius: '8px',
            listStyle: 'none',
            padding: '4px 0',
            margin: 0,
            zIndex: 10,
          }}>
            {results.map((school) => (
              <li
                key={school.name}
                onClick={() => handleSelect(school.name)}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'var(--sage-text)',
                  textAlign: 'left',
                }}
              >
                {school.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}