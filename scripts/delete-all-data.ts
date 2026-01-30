import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/alumnode'
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

async function deleteAllData() {
    try {
        console.log('Deleting all alumni records...')
        const deletedAlumni = await prisma.alumnus.deleteMany({})
        console.log(`✓ Deleted ${deletedAlumni.count} alumni records`)

        console.log('Deleting all projects...')
        const deletedProjects = await prisma.project.deleteMany({})
        console.log(`✓ Deleted ${deletedProjects.count} projects`)

        console.log('\n✅ All data deleted successfully!')
    } catch (error) {
        console.error('Error deleting data:', error)
    } finally {
        await prisma.$disconnect()
        await pool.end()
    }
}

deleteAllData()
