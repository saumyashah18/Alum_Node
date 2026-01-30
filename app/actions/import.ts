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

            // Get data as 2D array first to find the header row
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

            if (rows.length === 0) continue

            // Find the header row
            // We look for a row that has multiple non-empty cells and contains common header keywords
            let headerRowIndex = 0
            const commonHeaders = ['name', 'email', 'id', 'full name', 'student', 'year', 'batch', 'title', 'job']

            for (let i = 0; i < Math.min(rows.length, 20); i++) {
                const row = rows[i]
                if (!row || !Array.isArray(row)) continue

                const nonEmptyCount = row.filter(cell => cell !== null && cell !== undefined && String(cell).trim() !== '').length

                // If this row has many non-empty values, it's a candidate
                if (nonEmptyCount > 2) {
                    const rowText = row.join(' ').toLowerCase()
                    const hasCommonHeader = commonHeaders.some(h => rowText.includes(h))

                    if (hasCommonHeader) {
                        headerRowIndex = i
                        break
                    }

                    // Fallback: if we haven't found a row with keywords but this one has lots of data, 
                    // and the previous ones didn't, it might be the header row
                    if (i > 0 && nonEmptyCount > (rows[headerRowIndex]?.length || 0)) {
                        headerRowIndex = i
                    }
                }
            }

            // Re-read sheet starting from the identified header row
            const sheetData = XLSX.utils.sheet_to_json(sheet, {
                range: headerRowIndex
            }) as Record<string, string | number | null | undefined>[]

            // Filter out empty rows or rows that look like repetitions of headers
            const cleanedData = sheetData.filter(row => {
                const values = Object.values(row)
                const nonEmptyValues = values.filter(v => v !== null && v !== undefined && String(v).trim() !== '')
                return nonEmptyValues.length > 1
            })

            jsonData = jsonData.concat(cleanedData)
        }

        if (jsonData.length === 0) return { error: 'File is empty or contains no valid data' }

        const importMode = (formData.get('importMode') as string) || 'replace'

        // Handle Import Mode: Replace vs Append
        if (importMode === 'replace') {
            await prisma.alumnus.deleteMany({ where: { projectId } })
        }

        // Map rows to Alumnus model
        const alumniToCreate = jsonData.map((row) => {
            // Normalize ALL keys in the row data to avoid duplicates like "Email" vs "email"
            const data: Record<string, string | number | null | undefined> = {}
            for (const key of Object.keys(row)) {
                const normalizedKey = key.trim() // Keep casing for now, but trim. 
                // Or should we lowercase? The user says "filtering increases by twice", 
                // which usually happens if one file has "Batch" and another has "batch".
                // Let's lowercase for the key, but we can store the original key display name if we want.
                // For simplicity and matching the user's "twice" comment, lowercase is safest.
                data[normalizedKey.toLowerCase()] = row[key]
            }

            const findField = (possibleNames: string[]) => {
                for (const key of Object.keys(data)) {
                    if (possibleNames.some(name => key.toLowerCase() === name.toLowerCase())) {
                        return data[key]
                    }
                }
                return null
            }

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
                data: JSON.stringify(data)
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
