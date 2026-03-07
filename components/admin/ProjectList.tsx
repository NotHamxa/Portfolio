"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ProjectType } from '@/models/projectContent'
import { Pencil, Trash2, ExternalLink } from 'lucide-react'

interface Props {
    projects: ProjectType[]
}

export default function ProjectList({ projects: initial }: Props) {
    const [projects, setProjects] = useState(initial)
    const [deleting, setDeleting] = useState<string | null>(null)
    const router = useRouter()

    async function handleDelete(id: string, title: string) {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
        setDeleting(id)

        const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' })
        if (res.ok) {
            setProjects(prev => prev.filter(p => p.id !== id))
            router.refresh()
        }
        setDeleting(null)
    }

    if (projects.length === 0) {
        return (
            <div className="border border-dashed border-border rounded-lg p-12 text-center">
                <p className="text-muted-foreground">No projects yet.</p>
                <Button asChild className="mt-4">
                    <Link href="/admin/projects/new">Create your first project</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
            {projects.map(project => (
                <div key={project.id} className="flex items-center gap-4 px-4 py-3 bg-card hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{project.title}</span>
                            <span className="text-xs text-muted-foreground font-mono shrink-0">{project.date}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-0.5">{project.excerpt}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" asChild>
                            <a href={`/project/${project.id}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/projects/${project.id}`}>
                                <Pencil className="w-4 h-4" />
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(project.id, project.title)}
                            disabled={deleting === project.id}
                        >
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
}
