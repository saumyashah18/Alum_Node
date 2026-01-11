'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import * as XLSX from 'xlsx'

export async function importData(formData: FormData) {
    try {
        const projectId = formData.get('projectId') as string
        const file = formData.get('file') as File

        if (!projectId || !file) {
            return { error: 'Missing project ID or file' }
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const workbook = XLSX.read(buffer, { type: 'buffer' })

        // Read ALL sheets and combine data
        let jsonData: Record<string, string | number | null | undefined>[] = []
        for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName]
            const sheetData = XLSX.utils.sheet_to_json(sheet) as Record<string, string | number | null | undefined>[]
            jsonData = jsonData.concat(sheetData)
        }

        if (jsonData.length === 0) return { error: 'File is empty or contains no data' }

        // First, clear existing alumni for this project (Source of Truth principle)
        await prisma.alumnus.deleteMany({ where: { projectId } })

        // Map rows to Alumnus model - extract common fields and store everything in data field
        const alumniToCreate = jsonData.map((row) => {
            // Convert all row data to a clean object
            const data: Record<string, string | number | null | undefined> = { ...row }

            // Helper function to find field value case-insensitively
            const findField = (possibleNames: string[]) => {
                for (const key of Object.keys(data)) {
                    if (possibleNames.some(name => key.toLowerCase() === name.toLowerCase())) {
                        return data[key]
                    }
                }
                return null
            }

            // Extract common fields (case-insensitive)
            const name = findField(['name', 'full name', 'fullname', 'student name'])
            const email = findField(['email', 'e-mail', 'email address', 'mail'])
            const batch = findField(['batch', 'year', 'graduation year', 'class'])
            const organization = findField(['organization', 'company', 'employer', 'current organization'])
            const designation = findField(['designation', 'title', 'position', 'role', 'job title'])
            const location = findField(['location', 'city', 'place', 'address'])

            return {
                projectId,
                name: name ? String(name) : null,
                email: email ? String(email) : null,
                batch: batch ? String(batch) : null,
                organization: organization ? String(organization) : null,
                designation: designation ? String(designation) : null,
                location: location ? String(location) : null,
                data: JSON.stringify(data) // Store all columns as-is for full fidelity
            }
        })

        // Bulk create (Prisma createMany is efficient but SQLite has limits on params)
        const chunkSize = 500
        for (let i = 0; i < alumniToCreate.length; i += chunkSize) {
            const chunk = alumniToCreate.slice(i, i + chunkSize)
            await prisma.alumnus.createMany({
                data: chunk
            })
        }

        revalidatePath(`/projects/${projectId}`)
        return { success: true, count: alumniToCreate.length }
    } catch (error) {
        console.error('Import error:', error)
        return { error: 'Failed to import data: ' + (error instanceof Error ? error.message : String(error)) }
    }
}
