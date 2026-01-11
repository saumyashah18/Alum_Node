import { getProjects } from '@/app/actions/project'
import CreateProjectForm from '@/components/CreateProjectForm'
import Link from 'next/link'

export default async function ProjectsPage() {
    const projects = await getProjects()

    return (
        <div className="container">
            <div className="page-header">
                <h1>Projects</h1>
                <p>Manage your alumni databases and projects.</p>
            </div>

            <div className="projects-grid">
                <CreateProjectForm />

                {projects.map((project) => (
                    <div key={project.id} className="project-card card">
                        <div className="project-info">
                            <h3>{project.name}</h3>
                            <p>{project._count.alumni} alumni records</p>
                            <span className="date">Created on {new Date(project.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="project-actions">
                            <Link href={`/projects/${project.id}`} className="btn btn-primary">
                                Open Database
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    )
}
