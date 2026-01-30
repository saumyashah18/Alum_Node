'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface FilterParams {
    search?: string
    projectId: string
    filters?: Record<string, string> // Dynamic filters: { columnName: value }
}


export async function getAlumni(params: FilterParams) {
    const { projectId, search, filters } = params

    try {
        // Get all alumni for this project
        const rawAlumni = await prisma.alumnus.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
        })

        // Parse the JSON data field and type it properly
        type AlumnusWithParsedData = Omit<typeof rawAlumni[0], 'data'> & { data: Record<string, any> }

        let alumni: AlumnusWithParsedData[] = rawAlumni.map((a: typeof rawAlumni[0]): AlumnusWithParsedData => ({
            ...a,
            data: (a.data ? JSON.parse(a.data) : {}) as Record<string, any>
        }))

        // Apply search filter (searches across all fields in data)
        if (search) {
            const searchLower = search.toLowerCase()
            alumni = alumni.filter(a => {
                // Search in the JSON data
                const dataString = JSON.stringify(a.data).toLowerCase()
                return dataString.includes(searchLower)
            })
        }

        // Apply dynamic column filters
        if (filters && Object.keys(filters).length > 0) {
            alumni = alumni.filter(a => {
                // Check if all filter conditions match
                if (!a.data) return false // Skip if no data
                return Object.entries(filters).every(([column, value]) => {
                    if (!value) return true // Skip empty filters
                    // Additional null check to satisfy TypeScript
                    if (!a.data) return false
                    // Case-insensitive key lookup
                    const actualKey = Object.keys(a.data).find(k => k.trim().toLowerCase() === column.toLowerCase())
                    if (!actualKey) return false

                    const cellValue = a.data[actualKey]
                    if (cellValue === null || cellValue === undefined) return false
                    return String(cellValue).toLowerCase() === value.toLowerCase()
                })
            })
        }

        return alumni as any
    } catch (error) {
        console.error('Error in getAlumni:', error)
        return []
    }
}


export async function updateAlumnus(id: string, projectId: string, data: Record<string, string | number | null | undefined>) {
    try {
        // Extract common fields from data if they exist

        // Helper function to convert values to string | null | undefined (matching Prisma schema)
        const toStringOrNull = (value: string | number | null | undefined): string | null | undefined => {
            if (value === null || value === undefined) return value
            return String(value)
        }

        const normalizedData: Record<string, any> = {}
        for (const key of Object.keys(data)) {
            normalizedData[key.trim().toLowerCase()] = data[key]
        }

        const { name, batch, organization, designation, location, email } = normalizedData

        await prisma.alumnus.update({
            where: { id },
            data: {
                name: toStringOrNull(name),
                batch: toStringOrNull(batch),
                organization: toStringOrNull(organization),
                designation: toStringOrNull(designation),
                location: toStringOrNull(location),
                email: toStringOrNull(email),
                data: JSON.stringify(normalizedData),
            }
        })
        revalidatePath(`/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        return { error: 'Failed to update record' }
    }
}

export async function deleteAlumnus(id: string, projectId: string) {
    try {
        await prisma.alumnus.delete({
            where: { id }
        })
        revalidatePath(`/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        return { error: 'Failed to delete record' }
    }
}

export async function bulkDeleteAlumni(params: FilterParams) {
    try {
        const { projectId, search, filters } = params

        // Get all alumni that match the filters
        const alumniToDelete = await getAlumni(params)
        const idsToDelete = alumniToDelete.map((a: any) => a.id)

        if (idsToDelete.length === 0) {
            return { success: true, count: 0 }
        }

        // Delete by IDs
        const result = await prisma.alumnus.deleteMany({
            where: {
                id: { in: idsToDelete }
            }
        })

        revalidatePath(`/projects/${projectId}`)
        return { success: true, count: result.count }
    } catch (error) {
        return { error: 'Failed to delete records' }
    }
}



export async function getFilterOptions(projectId: string) {
    try {
        // Get all alumni for this project
        const alumni = await prisma.alumnus.findMany({
            where: { projectId },
            select: { data: true }
        })

        if (alumni.length === 0) {
            return {}
        }

        // Parse all data and collect unique column names (case-insensitive)
        const allData: Record<string, any>[] = alumni.map((a: typeof alumni[0]) => a.data ? JSON.parse(a.data) : {})
        const normalizedColumns = new Set<string>()

        allData.forEach((data: Record<string, any>) => {
            Object.keys(data).forEach(key => {
                if (key) normalizedColumns.add(key.trim().toLowerCase())
            })
        })

        // For each normalized column, get unique values
        const filterOptions: Record<string, string[]> = {}

        normalizedColumns.forEach(column => {
            const uniqueValues = new Set<string>()

            allData.forEach((data: Record<string, any>) => {
                // Find value by checking all keys for a match
                const actualKey = Object.keys(data).find(k => k.trim().toLowerCase() === column)
                if (actualKey) {
                    const value = data[actualKey]
                    if (value !== null && value !== undefined && value !== '') {
                        uniqueValues.add(String(value))
                    }
                }
            })

            // Only include columns that have reasonable number of unique values (good for filtering)
            // Skip columns with too few (like single value) or too many that they are likely unique IDs
            const values = Array.from(uniqueValues).sort()

            // Relaxed limit: only skip if there are more than 1000 unique values (e.g. actual unique IDs)
            if (values.length > 1 && values.length <= 1000) {
                filterOptions[column] = values
            }
        })

        return filterOptions
    } catch (error) {
        console.error('Error getting filter options:', error)
        return {}
    }
}

export async function createAlumnus(projectId: string, data: Record<string, any>) {
    try {
        const normalizedData: Record<string, any> = {}
        for (const key of Object.keys(data)) {
            normalizedData[key.trim().toLowerCase()] = data[key]
        }

        const { name, batch, organization, designation, location, email } = normalizedData

        const toStringOrNull = (value: any): string | null => {
            if (value === null || value === undefined || value === '') return null
            return String(value)
        }

        await prisma.alumnus.create({
            data: {
                projectId,
                name: toStringOrNull(name),
                batch: toStringOrNull(batch),
                organization: toStringOrNull(organization),
                designation: toStringOrNull(designation),
                location: toStringOrNull(location),
                email: toStringOrNull(email),
                data: JSON.stringify(normalizedData),
            }
        })

        revalidatePath(`/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        console.error('Error creating alumnus:', error)
        return { error: 'Failed to create record' }
    }
}

export async function addAttributeToProject(projectId: string, attributeNameInput: string) {
    try {
        const attributeName = attributeNameInput.trim().toLowerCase()
        const alumni = await prisma.alumnus.findMany({
            where: { projectId },
        })

        if (alumni.length === 0) {
            return { error: 'No alumni found in this project' }
        }

        // Bulk update is hard in Prisma for JSON fields inside strings
        // So we update each one. If there are thousands, this might be slow, 
        // but for typical usage it's fine.
        for (const alumnus of alumni) {
            const currentData = alumnus.data ? JSON.parse(alumnus.data) : {}
            if (!(attributeName in currentData)) {
                currentData[attributeName] = ""
                await prisma.alumnus.update({
                    where: { id: alumnus.id },
                    data: { data: JSON.stringify(currentData) }
                })
            }
        }

        revalidatePath(`/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        console.error('Error adding attribute:', error)
        return { error: 'Failed to add attribute' }
    }
}
