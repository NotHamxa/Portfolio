"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TimelineType, TimelineEntry } from '@/models/timelineContent'
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'

interface Props {
    initial?: TimelineType
    mode: 'create' | 'edit'
}

function today(): string {
    return new Date().toISOString().slice(0, 10)
}

export default function TimelineForm({ initial, mode }: Props) {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const [title, setTitle] = useState(initial?.title ?? '')
    const [entries, setEntries] = useState<TimelineEntry[]>(initial?.entries ?? [])

    function addEntry() {
        setEntries(prev => [{ date: today(), note: '' }, ...prev])
    }
    function removeEntry(i: number) {
        setEntries(prev => prev.filter((_, idx) => idx !== i))
    }
    function updateEntry(i: number, field: keyof TimelineEntry, val: string) {
        setEntries(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: val } : e))
    }
    function moveEntry(i: number, delta: -1 | 1) {
        const target = i + delta
        if (target < 0 || target >= entries.length) return
        const next = [...entries]
        ;[next[i], next[target]] = [next[target], next[i]]
        setEntries(next)
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setSaving(true)
        setError('')

        const body = {
            title,
            entries: entries
                .filter(en => en.date.trim() && en.note.trim())
                .map(en => ({ date: en.date.trim(), note: en.note.trim() })),
        }

        const url = mode === 'create'
            ? '/api/admin/timelines'
            : `/api/admin/timelines/${initial!.id}`
        const method = mode === 'create' ? 'POST' : 'PUT'

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })

        if (res.ok) {
            router.push('/admin/timelines')
            router.refresh()
        } else {
            const data = await res.json().catch(() => ({}))
            setError((data as { error?: string }).error ?? `Request failed (${res.status})`)
        }
        setSaving(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="space-y-2 max-w-md">
                <Label htmlFor="title">Project name</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. ATS"
                    required
                    disabled={mode === 'edit'}
                />
                {mode === 'edit' && (
                    <p className="text-xs text-muted-foreground">Name is used as the URL slug and cannot be changed.</p>
                )}
            </div>

            {/* API access info (edit only) */}
            {mode === 'edit' && (
                <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
                    <p className="text-sm font-medium">Programmatic access</p>
                    <p className="text-xs text-muted-foreground">
                        An agent can append entries by POSTing to the endpoint below with the shared secret
                        (<code className="font-mono">TIMELINE_API_SECRET</code>) as a Bearer token.
                    </p>
                    <pre className="text-xs font-mono bg-background/60 border border-border rounded p-3 overflow-x-auto whitespace-pre-wrap">{`POST /api/timelines/${initial!.id}/entries
Authorization: Bearer <TIMELINE_API_SECRET>
Content-Type: application/json

{ "date": "YYYY-MM-DD", "note": "what you worked on" }`}</pre>
                    <p className="text-xs text-muted-foreground"><code className="font-mono">date</code> is optional and defaults to today.</p>
                </div>
            )}

            {/* Entries */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label>Progress entries</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addEntry} className="gap-1">
                        <Plus className="w-3 h-3" /> Add entry
                    </Button>
                </div>

                {entries.length === 0 && (
                    <p className="text-sm text-muted-foreground border border-dashed border-border rounded-lg p-6 text-center">
                        No entries yet. Add one to start the log.
                    </p>
                )}

                <div className="space-y-3">
                    {entries.map((entry, i) => (
                        <div key={i} className="flex gap-2 items-start border border-border rounded-lg p-3 bg-card">
                            <div className="flex flex-col shrink-0 pt-1">
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6"
                                    onClick={() => moveEntry(i, -1)} disabled={i === 0}>
                                    <ArrowUp className="w-3.5 h-3.5" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6"
                                    onClick={() => moveEntry(i, 1)} disabled={i === entries.length - 1}>
                                    <ArrowDown className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                            <div className="flex-1 space-y-2 min-w-0">
                                <Input
                                    value={entry.date}
                                    onChange={e => updateEntry(i, 'date', e.target.value)}
                                    placeholder="Date (e.g. 2026-07-09 or Thur)"
                                    className="w-56"
                                />
                                <textarea
                                    value={entry.note}
                                    onChange={e => updateEntry(i, 'note', e.target.value)}
                                    placeholder="Progress note..."
                                    rows={2}
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
                                />
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="shrink-0"
                                onClick={() => removeEntry(i)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : mode === 'create' ? 'Create timeline' : 'Save changes'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
            </div>
        </form>
    )
}
