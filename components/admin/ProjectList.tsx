"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ProjectType } from '@/models/projectContent'
import { Pencil, Trash2, ExternalLink, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react'

interface Props {
    projects: ProjectType[]
}

export default function ProjectList({ projects: initial }: Props) {
    const [projects, setProjects] = useState(initial)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [busy, setBusy] = useState<string | null>(null)
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

    async function toggleShow(project: ProjectType) {
        const next = project.show === false
        setBusy(project.id)
        const res = await fetch(`/api/admin/projects/${project.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ show: next }),
        })
        if (res.ok) {
            setProjects(prev => prev.map(p => p.id === project.id ? { ...p, show: next } : p))
            router.refresh()
        }
        setBusy(null)
    }

    async function move(index: number, delta: -1 | 1) {
        const target = index + delta
        if (target < 0 || target >= projects.length) return
        const next = [...projects]
        ;[next[index], next[target]] = [next[target], next[index]]
        setProjects(next)
        setBusy(next[target].id)
        const res = await fetch('/api/admin/projects', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: next.map(p => p.id) }),
        })
        if (res.ok) {
            router.refresh()
        } else {
            setProjects(projects)
        }
        setBusy(null)
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
            {projects.map((project, index) => {
                const hidden = project.show === false
                return (
                    <div
                        key={project.id}
                        className={`flex items-center gap-4 px-4 py-3 bg-card hover:bg-muted/30 transition-colors ${hidden ? 'opacity-60' : ''}`}
                    >
                        <div className="flex flex-col shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => move(index, -1)}
                                disabled={index === 0 || busy !== null}
                            >
                                <ArrowUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => move(index, 1)}
                                disabled={index === projects.length - 1 || busy !== null}
                            >
                                <ArrowDown className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{project.title}</span>
                                <span className="text-xs text-muted-foreground font-mono shrink-0">{project.date}</span>
                                {hidden && (
                                    <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                                        Hidden
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate mt-0.5">{project.excerpt}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleShow(project)}
                                disabled={busy === project.id}
                                title={hidden ? 'Show on homepage' : 'Hide from homepage'}
                            >
                                {hidden
                                    ? <EyeOff className="w-4 h-4 text-muted-foreground" />
                                    : <Eye className="w-4 h-4" />}
                            </Button>
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
                )
            })}
        </div>
    )
}
