'use client'

import { useState } from 'react'
import { deleteProject } from '@/app/actions/projects'
import { useRouter } from 'next/navigation'

interface DeleteProjectButtonProps {
    projectId: string
    projectName: string
}

export default function DeleteProjectButton({ projectId, projectName }: DeleteProjectButtonProps) {
    const [deleting, setDeleting] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        const confirmMessage = `⚠️ WARNING: This will permanently delete the project "${projectName}" and ALL ${projectName} alumni records.\n\nThis action CANNOT be undone.\n\nType the project name to confirm deletion.`

        const userInput = prompt(confirmMessage)

        if (userInput !== projectName) {
            if (userInput !== null) {
                alert('Project name does not match. Deletion cancelled.')
            }
            return
        }

        setDeleting(true)

        const result = await deleteProject(projectId)

        if (result.success) {
            router.push('/projects')
        } else {
            alert(`❌ ${result.error}`)
            setDeleting(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn btn-danger"
            title="Delete this project and all its data"
        >
            {deleting ? '🗑️ Deleting...' : '🗑️ Delete Project'}
        </button>
    )
}
