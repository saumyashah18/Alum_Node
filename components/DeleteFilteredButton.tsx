'use client'

import { useState } from 'react'
import { bulkDeleteAlumni } from '@/app/actions/alumni'
import { useRouter } from 'next/navigation'

interface DeleteFilteredButtonProps {
    projectId: string
    currentFilters: Record<string, string | undefined>
    filteredCount: number
    totalCount: number
}

export default function DeleteFilteredButton({
    projectId,
    currentFilters,
    filteredCount,
    totalCount
}: DeleteFilteredButtonProps) {
    const [deleting, setDeleting] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        // Extract search and filters
        const { search, ...filters } = currentFilters
        const hasFilters = search || Object.values(filters).some(v => v)

        if (!hasFilters) {
            alert('⚠️ Please apply filters first to delete specific records. To delete all records, re-upload an empty file.')
            return
        }

        const confirmMessage = `Are you sure you want to delete ${filteredCount} filtered record(s)?\n\nThis action cannot be undone.`

        if (!confirm(confirmMessage)) {
            return
        }

        setDeleting(true)

        // Remove undefined values from filters
        const cleanFilters: Record<string, string> = {}
        Object.entries(filters).forEach(([key, value]) => {
            if (value) cleanFilters[key] = value
        })

        const result = await bulkDeleteAlumni({
            projectId,
            search,
            filters: Object.keys(cleanFilters).length > 0 ? cleanFilters : undefined,
        })

        if (result.success) {
            alert(`✅ Successfully deleted ${result.count} record(s)`)
            router.refresh()
        } else {
            alert(`❌ ${result.error}`)
        }

        setDeleting(false)
    }

    const { search, ...filters } = currentFilters
    const hasFilters = search || Object.values(filters).some(v => v)
    const isFiltered = filteredCount !== totalCount

    return (
        <button
            onClick={handleDelete}
            disabled={deleting || !hasFilters}
            className="btn btn-danger"
            style={{ opacity: !hasFilters ? 0.5 : 1 }}
            title={!hasFilters ? 'Apply filters first' : `Delete ${filteredCount} filtered record(s)`}
        >
            {deleting ? '🗑️ Deleting...' : `🗑️ Delete Filtered ${isFiltered ? `(${filteredCount})` : ''}`}
        </button>
    )
}
