'use client'

import { useState, useMemo } from 'react'
import AlumniTable from './AlumniTable'
import FilterSidebarClient from './FilterSidebarClient'
import ExportButton from './ExportButton'
import DeleteFilteredButton from './DeleteFilteredButton'
import FileUpload from './FileUpload'

interface AlumnusData {
    [key: string]: string | number | null | undefined
}

interface Alumnus {
    id: string
    projectId: string
    data: AlumnusData
    createdAt: Date
    updatedAt: Date
}

interface ProjectPageClientProps {
    alumni: Alumnus[]
    projectId: string
    filterOptions: Record<string, string[]>
    totalCount: number
}

export default function ProjectPageClient({
    alumni: allAlumni,
    projectId,
    filterOptions,
    totalCount
}: ProjectPageClientProps) {
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState<Record<string, string>>({})

    // Client-side filtering
    const filteredAlumni = useMemo(() => {
        let result = allAlumni

        // Apply search filter
        if (search) {
            const searchLower = search.toLowerCase()
            result = result.filter(alumnus => {
                const dataString = JSON.stringify(alumnus.data).toLowerCase()
                return dataString.includes(searchLower)
            })
        }

        // Apply column filters
        Object.entries(filters).forEach(([column, value]) => {
            if (value) {
                result = result.filter(alumnus => {
                    const cellValue = alumnus.data?.[column]
                    if (cellValue === null || cellValue === undefined) return false
                    return String(cellValue).toLowerCase() === value.toLowerCase()
                })
            }
        })

        return result
    }, [allAlumni, search, filters])

    return (
        <div className="database-layout">
            <aside className="sidebar-container">
                <div className="sidebar-section">
                    <h3>Update Database</h3>
                    <FileUpload projectId={projectId} />
                </div>
                <FilterSidebarClient
                    filterOptions={filterOptions}
                    search={search}
                    filters={filters}
                    onSearchChange={setSearch}
                    onFiltersChange={setFilters}
                />
            </aside>

            <main className="table-container">
                <div className="section-header">
                    <h3>
                        Master Database
                        {filteredAlumni.length !== totalCount && (
                            <span className="filter-count"> ({filteredAlumni.length} results)</span>
                        )}
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <DeleteFilteredButton
                            projectId={projectId}
                            currentFilters={{
                                search,
                                ...filters
                            }}
                            filteredCount={filteredAlumni.length}
                            totalCount={totalCount}
                        />
                        <ExportButton projectId={projectId} filteredAlumni={filteredAlumni} />
                    </div>
                </div>
                <AlumniTable alumni={filteredAlumni} projectId={projectId} />
            </main>
        </div>
    )
}
