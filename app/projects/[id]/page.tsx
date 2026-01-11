import prisma from '@/lib/prisma'
import FileUpload from '@/components/FileUpload'
import DownloadTemplateButton from '@/components/DownloadTemplateButton'
import DeleteProjectButton from '@/components/DeleteProjectButton'
import ProjectPageClient from '@/components/ProjectPageClient'
import { getAlumni, getFilterOptions } from '@/app/actions/alumni'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface ProjectPageProps {
  params: { id: string }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = (await params)

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      _count: {
        select: { alumni: true }
      }
    }
  })

  if (!project) notFound()

  // Fetch all alumni without filters for client-side filtering
  const alumni = await getAlumni({
    projectId: id,
  })

  const filterOptions = await getFilterOptions(id)

  return (
    <div>
      <div className="breadcrumb">
        <Link href="/projects">← Back to Projects</Link>
      </div>

      <div className="page-header">
        <div className="container">
          <div className="header-content">
            <div className="header-info">
              <h1>{project.name}</h1>
              <p className="subtitle">Master Database: {project._count.alumni} Records</p>
            </div>
            <div className="header-actions">
              <DeleteProjectButton projectId={project.id} projectName={project.name} />
              <DownloadTemplateButton />
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <ProjectPageClient
          alumni={alumni}
          projectId={project.id}
          filterOptions={filterOptions}
          totalCount={project._count.alumni}
        />
      </div>
    </div>
  )
}

