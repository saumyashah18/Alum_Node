'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface FilterSidebarProps {
  filterOptions: Record<string, string[]> // { columnName: [unique values] }
}

export default function FilterSidebar({ filterOptions }: FilterSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [filters, setFilters] = useState<Record<string, string>>({})

  // Initialize filters from URL params on mount
  useEffect(() => {
    const initialFilters: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      if (key !== 'search' && key.startsWith('filter_')) {
        const columnName = key.replace('filter_', '')
        initialFilters[columnName] = value
      }
    })
    setFilters(initialFilters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Update URL when filters change (with debounce for search)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams()

      if (search) params.set('search', search)

      Object.entries(filters).forEach(([column, value]) => {
        if (value) params.set(`filter_${column}`, value)
      })

      const query = params.toString()
      const newUrl = `${pathname}${query ? `?${query}` : ''}`

      startTransition(() => {
        router.push(newUrl)
      })
    }, search ? 500 : 0) // Debounce search by 500ms, filters apply immediately

    return () => clearTimeout(timeoutId)
  }, [search, filters, pathname, router])

  function handleFilterChange(column: string, value: string) {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }))
  }

  function resetFilters() {
    setSearch('')
    setFilters({})
  }

  const columnNames = Object.keys(filterOptions).sort()
  const hasActiveFilters = search || Object.values(filters).some(v => v)

  return (
    <div className="sidebar card">
      <div className="filter-group">
        <label>Search</label>
        <input
          type="text"
          placeholder="Search across all fields..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-input"
        />
      </div>

      {columnNames.map(column => (
        <div key={column} className="filter-group">
          <label>{column}</label>
          <select
            value={filters[column] || ''}
            onChange={(e) => handleFilterChange(column, e.target.value)}
            className="filter-input"
          >
            <option value="">All {column}</option>
            {filterOptions[column].map(value => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>
      ))}

      {hasActiveFilters && (
        <button className="btn btn-outline" onClick={resetFilters}>
          Reset Filters
        </button>
      )}

      {isPending && (
        <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>
          Filtering...
        </div>
      )}
    </div>
  )
}
