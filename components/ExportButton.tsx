'use client'

import { useState } from 'react'
import { exportToExcel } from '@/app/actions/export'

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

interface ExportButtonProps {
    projectId: string
    filteredAlumni: Alumnus[]
}

export default function ExportButton({ projectId, filteredAlumni }: ExportButtonProps) {
    const [exporting, setExporting] = useState(false)

    async function handleExport() {
        setExporting(true)

        // Export the filtered alumni data directly
        const result = await exportToExcel({
            projectId,
            filteredData: filteredAlumni
        })

        if (result.success && result.buffer) {
            const blob = new Blob([new Uint8Array(result.buffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = result.fileName || 'export.xlsx'
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } else {
            alert(result.error || 'Failed to export')
        }

        setExporting(false)
    }


    return (
        <button
            onClick={handleExport}
            className="btn btn-outline btn-export"
            disabled={exporting}
        >
            {exporting ? 'Exporting...' : 'Export Filtered Data'}
        </button>
    )
}
