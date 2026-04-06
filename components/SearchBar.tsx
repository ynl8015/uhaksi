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

  const handleSearch = () => {
    if (!query.trim()) return
    setShow(false)
    router.push(`/school/${encodeURIComponent(query)}`)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="학교 이름을 입력하세요"
      />
      <button onClick={handleSearch}>검색</button>

      {show && results.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid #ccc',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          zIndex: 10,
        }}>
          {results.map((school) => (
            <li
              key={school.name}
              onClick={() => handleSelect(school.name)}
              style={{ padding: '8px', cursor: 'pointer' }}
            >
              {school.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}