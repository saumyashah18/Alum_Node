'use client'

interface FilterSidebarClientProps {
    filterOptions: Record<string, string[]>
    search: string
    filters: Record<string, string>
    onSearchChange: (search: string) => void
    onFiltersChange: (filters: Record<string, string>) => void
}

export default function FilterSidebarClient({
    filterOptions,
    search,
    filters,
    onSearchChange,
    onFiltersChange
}: FilterSidebarClientProps) {
    function handleFilterChange(column: string, value: string) {
        onFiltersChange({
            ...filters,
            [column]: value
        })
    }

    function resetFilters() {
        onSearchChange('')
        onFiltersChange({})
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
                    onChange={(e) => onSearchChange(e.target.value)}
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
        </div>
    )
}
