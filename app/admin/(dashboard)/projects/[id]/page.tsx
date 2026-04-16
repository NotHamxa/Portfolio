import { notFound } from 'next/navigation'
import { getProject } from '@/lib/db'
import ProjectForm from '@/components/admin/ProjectForm'

export const dynamic = 'force-dynamic'

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const project = await getProject(id, { fresh: true })
    if (!project) notFound()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Edit — {project.title}</h1>
            </div>
            <ProjectForm mode="edit" initial={project} />
        </div>
    )
}
