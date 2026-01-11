'use client'

import { useState } from 'react'
import { generateTemplate } from '@/app/actions/template'

export default function DownloadTemplateButton() {
    const [loading, setLoading] = useState(false)

    async function handleDownload() {
        setLoading(true)
        try {
            const result = await generateTemplate()
            if (result.success && result.buffer) {
                // Create a blob from the buffer
                const blob = new Blob([new Uint8Array(result.buffer)], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                })

                // Create a link and trigger download
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = result.fileName || 'template.xlsx'
                document.body.appendChild(a)
                a.click()

                // Cleanup
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            } else {
                alert('Failed to download template')
            }
        } catch (error) {
            console.error(error)
            alert('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            className="btn btn-outline flex items-center gap-2"
        >
            {loading ? 'Generating...' : (
                <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download Sample Template
                </>
            )}
        </button>
    )
}
