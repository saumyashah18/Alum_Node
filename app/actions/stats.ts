'use server'

import prisma from '@/lib/prisma'

export async function getDashboardStats() {
    try {
        const totalProjects = await prisma.project.count()
        const totalAlumni = await prisma.alumnus.count()

        const batchStats = await prisma.alumnus.groupBy({
            by: ['batch'],
            _count: { _all: true },
            where: { batch: { not: null } },
            orderBy: { batch: 'asc' },
            take: 10
        })

        const orgStats = await prisma.alumnus.groupBy({
            by: ['organization'],
            _count: { _all: true },
            where: { organization: { not: null } },
            orderBy: { _count: { organization: 'desc' } },
            take: 10
        })

        return {
            totalProjects,
            totalAlumni,
            batchData: batchStats
                .filter(s => s.batch !== null)
                .map(s => ({ name: s.batch as string, value: s._count._all })),
            orgData: orgStats
                .filter(s => s.organization !== null)
                .map(s => ({ name: s.organization as string, value: s._count._all }))
        }
    } catch (error) {
        console.error(error)
        return {
            totalProjects: 0,
            totalAlumni: 0,
            batchData: [],
            orgData: []
        }
    }
}
