'use server'

import ExcelJS from 'exceljs'
import { FilterParams, getAlumni } from './alumni'

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

interface ExportParams extends FilterParams {
    filteredData?: Alumnus[]
}

export async function exportToExcel(params: ExportParams) {
    try {
        // Use filteredData if provided (client-side filtering), otherwise fetch from DB
        const alumni = params.filteredData || await getAlumni(params)

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Alumni Data')

        if (alumni.length === 0) return { error: 'No data to export' }

        // Determine all columns from the data
        const allKeys: string[] = Array.from(new Set(alumni.flatMap((a: any) => Object.keys(a.data || {}))))
        const columns = allKeys

        worksheet.columns = columns.map((col: string) => ({
            header: col.charAt(0).toUpperCase() + col.slice(1),
            key: col,
            width: 20
        }))

        alumni.forEach((person: any) => {
            const rowData: Record<string, string | number | null | undefined> = { ...person.data }
            worksheet.addRow(rowData)
        })

        const buffer = await workbook.xlsx.writeBuffer()
        return {
            success: true,
            buffer: Array.from(new Uint8Array(buffer)), // Convert to array for serialization
            fileName: `Alumni_Export_${new Date().toISOString().split('T')[0]}.xlsx`
        }
    } catch (error) {
        console.error(error)
        return { error: 'Failed to export data' }
    }
}
