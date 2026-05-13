import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getProject, getProjects } from '@/lib/db'
import ProjectDetailClient from '@/components/ProjectDetailClient'

export const revalidate = 3600

export async function generateStaticParams() {
    try {
        const projects = await getProjects()
        return projects.map(p => ({ slug: p.id }))
    } catch {
        return []
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const project = await getProject(slug)
    if (!project) return { title: 'Not found' }
    return {
        title: `${project.title} — Hamza Ahmed`,
        description: project.excerpt,
    }
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const [project, allProjects] = await Promise.all([
        getProject(slug),
        getProjects(),
    ])
    if (!project) notFound()

    return (
        <ProjectDetailClient
            data={project}
            allProjects={allProjects.filter(p => p.show)}
        />
    )
}
