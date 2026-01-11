'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteProject(projectId: string) {
    try {
        // Delete all alumni records first (cascade)
        await prisma.alumnus.deleteMany({
            where: { projectId }
        })

        // Delete the project
        await prisma.project.delete({
            where: { id: projectId }
        })

        revalidatePath('/projects')
        return { success: true }
    } catch (error) {
        console.error('Delete project error:', error)
        return { error: 'Failed to delete project' }
    }
}
