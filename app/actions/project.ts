'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
    const name = formData.get('name') as string
    if (!name) return { error: 'Name is required' }

    try {
        const project = await prisma.project.create({
            data: { name }
        })
        revalidatePath('/projects')
        return { success: true, project }
    } catch (error) {
        return { error: 'Failed to create project' }
    }
}

export async function getProjects() {
    try {
        return await prisma.project.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { alumni: true }
                }
            }
        })
    } catch (error) {
        console.error(error)
        return []
    }
}

export async function deleteProject(id: string) {
    try {
        await prisma.project.delete({ where: { id } })
        revalidatePath('/projects')
        return { success: true }
    } catch (error) {
        return { error: 'Failed to delete project' }
    }
}
