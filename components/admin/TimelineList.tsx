"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { TimelineType } from '@/models/timelineContent'
import { Pencil, Trash2, ExternalLink, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react'

interface Props {
    timelines: TimelineType[]
}

export default function TimelineList({ timelines: initial }: Props) {
    const [timelines, setTimelines] = useState(initial)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [busy, setBusy] = useState<string | null>(null)
    const router = useRouter()

    async function handleDelete(id: string, title: string) {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
        setDeleting(id)

        const res = await fetch(`/api/admin/timelines/${id}`, { method: 'DELETE' })
        if (res.ok) {
            setTimelines(prev => prev.filter(t => t.id !== id))
            router.refresh()
        }
        setDeleting(null)
    }

    async function toggleShow(timeline: TimelineType) {
        const next = timeline.show === false
        setBusy(timeline.id)
        const res = await fetch(`/api/admin/timelines/${timeline.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ show: next }),
        })
        if (res.ok) {
            setTimelines(prev => prev.map(t => t.id === timeline.id ? { ...t, show: next } : t))
            router.refresh()
        }
        setBusy(null)
    }

    async function move(index: number, delta: -1 | 1) {
        const target = index + delta
        if (target < 0 || target >= timelines.length) return
        const next = [...timelines]
        ;[next[index], next[target]] = [next[target], next[index]]
        setTimelines(next)
        setBusy(next[target].id)
        const res = await fetch('/api/admin/timelines', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: next.map(t => t.id) }),
        })
        if (res.ok) {
            router.refresh()
        } else {
            setTimelines(timelines)
        }
        setBusy(null)
    }

    if (timelines.length === 0) {
        return (
            <div className="border border-dashed border-border rounded-lg p-12 text-center">
                <p className="text-muted-foreground">No timelines yet.</p>
                <Button asChild className="mt-4">
                    <Link href="/admin/timelines/new">Create your first timeline</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
            {timelines.map((timeline, index) => {
                const hidden = timeline.show === false
                const count = timeline.entries?.length ?? 0
                return (
                    <div
                        key={timeline.id}
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
                                disabled={index === timelines.length - 1 || busy !== null}
                            >
                                <ArrowDown className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{timeline.title}</span>
                                <span className="text-xs text-muted-foreground font-mono shrink-0">/timeline/{timeline.id}</span>
                                {hidden && (
                                    <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                                        Hidden
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate mt-0.5">
                                {count} {count === 1 ? 'entry' : 'entries'}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleShow(timeline)}
                                disabled={busy === timeline.id}
                                title={hidden ? 'Show timeline' : 'Hide timeline'}
                            >
                                {hidden
                                    ? <EyeOff className="w-4 h-4 text-muted-foreground" />
                                    : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                                <a href={`/timeline/${timeline.id}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                                <Link href={`/admin/timelines/${timeline.id}`}>
                                    <Pencil className="w-4 h-4" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(timeline.id, timeline.title)}
                                disabled={deleting === timeline.id}
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
