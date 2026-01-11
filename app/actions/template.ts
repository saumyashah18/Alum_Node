'use server'

import ExcelJS from 'exceljs'

export async function generateTemplate() {
    try {
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Alumni Import Template')

        // Define columns
        worksheet.columns = [
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Batch', key: 'batch', width: 10 },
            { header: 'Organization', key: 'organization', width: 25 },
            { header: 'Designation', key: 'designation', width: 25 },
            { header: 'Location', key: 'location', width: 15 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'LinkedIn', key: 'linkedin', width: 30 }, // Example custom field
        ]

        // Add a sample row to guide the user
        worksheet.addRow({
            name: 'John Doe',
            batch: '2023',
            organization: 'Tech Corp',
            designation: 'Software Engineer',
            location: 'New York',
            email: 'john@example.com',
            linkedin: 'linkedin.com/in/johndoe'
        })

        // Style the header row
        const headerRow = worksheet.getRow(1)
        headerRow.font = { bold: true }
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' } // Light gray
        }

        const buffer = await workbook.xlsx.writeBuffer()

        return {
            success: true,
            buffer: Array.from(new Uint8Array(buffer)),
            fileName: 'Alumni_Import_Template.xlsx'
        }
    } catch (error) {
        console.error('Error generating template:', error)
        return { error: 'Failed to generate template' }
    }
}
