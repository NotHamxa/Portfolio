"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ContentEditor from './ContentEditor'
import { ProjectType, GithubRepo } from '@/models/projectContent'
import { Plus, Trash2 } from 'lucide-react'

interface Props {
    initial?: ProjectType
    mode: 'create' | 'edit'
}

export default function ProjectForm({ initial, mode }: Props) {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const [title, setTitle] = useState(initial?.title ?? '')
    const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '')
    const [date, setDate] = useState(initial?.date ?? '')
    const [logo, setLogo] = useState(initial?.logo ?? '')
    const [content, setContent] = useState(initial?.content ?? '')
    const [downloadUrls, setDownloadUrls] = useState<{ platform: string; url: string }[]>(
        initial?.downloadUrl
            ? Object.entries(initial.downloadUrl).map(([platform, url]) => ({ platform, url }))
            : []
    )
    const [githubUrls, setGithubUrls] = useState<GithubRepo[]>(initial?.githubUrl ?? [])

    function addDownload() {
        setDownloadUrls(prev => [...prev, { platform: '', url: '' }])
    }
    function removeDownload(i: number) {
        setDownloadUrls(prev => prev.filter((_, idx) => idx !== i))
    }
    function updateDownload(i: number, field: 'platform' | 'url', val: string) {
        setDownloadUrls(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: val } : d))
    }

    function addGithub() {
        setGithubUrls(prev => [...prev, { name: '', link: '' }])
    }
    function removeGithub(i: number) {
        setGithubUrls(prev => prev.filter((_, idx) => idx !== i))
    }
    function updateGithub(i: number, field: 'name' | 'link', val: string) {
        setGithubUrls(prev => prev.map((g, idx) => idx === i ? { ...g, [field]: val } : g))
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setSaving(true)
        setError('')

        const body = {
            title,
            excerpt,
            date,
            logo: logo || null,
            content,
            downloadUrl: downloadUrls.length > 0
                ? Object.fromEntries(downloadUrls.filter(d => d.platform && d.url).map(d => [d.platform, d.url]))
                : null,
            githubUrl: githubUrls.filter(g => g.name && g.link),
        }

        const url = mode === 'create'
            ? '/api/admin/projects'
            : `/api/admin/projects/${initial!.id}`
        const method = mode === 'create' ? 'POST' : 'PUT'

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })

        if (res.ok) {
            router.push('/admin/projects')
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

            {/* Basic info */}
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Project name"
                        required
                        disabled={mode === 'edit'}
                    />
                    {mode === 'edit' && (
                        <p className="text-xs text-muted-foreground">Title is used as the URL slug and cannot be changed.</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                        id="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        placeholder="e.g. May 2025 or Jan - Aug 2024"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Input
                    id="excerpt"
                    value={excerpt}
                    onChange={e => setExcerpt(e.target.value)}
                    placeholder="Short description shown on the project card"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="logo">Logo path</Label>
                <Input
                    id="logo"
                    value={logo}
                    onChange={e => setLogo(e.target.value)}
                    placeholder="/images/project/logo.png  (leave blank for none)"
                />
            </div>

            {/* Download URLs */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label>Download links</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addDownload} className="gap-1">
                        <Plus className="w-3 h-3" /> Add
                    </Button>
                </div>
                {downloadUrls.map((d, i) => (
                    <div key={i} className="flex gap-2">
                        <Input
                            value={d.platform}
                            onChange={e => updateDownload(i, 'platform', e.target.value)}
                            placeholder="Platform (e.g. windows)"
                            className="w-40 shrink-0"
                        />
                        <Input
                            value={d.url}
                            onChange={e => updateDownload(i, 'url', e.target.value)}
                            placeholder="https://..."
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeDownload(i)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </div>
                ))}
            </div>

            {/* GitHub URLs */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label>GitHub repositories</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addGithub} className="gap-1">
                        <Plus className="w-3 h-3" /> Add
                    </Button>
                </div>
                {githubUrls.map((g, i) => (
                    <div key={i} className="flex gap-2">
                        <Input
                            value={g.name}
                            onChange={e => updateGithub(i, 'name', e.target.value)}
                            placeholder="Repo label"
                            className="w-48 shrink-0"
                        />
                        <Input
                            value={g.link}
                            onChange={e => updateGithub(i, 'link', e.target.value)}
                            placeholder="https://github.com/..."
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeGithub(i)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                    </div>
                ))}
            </div>

            {/* Content editor */}
            <div className="space-y-2">
                <Label>Content</Label>
                <ContentEditor value={content} onChange={setContent} />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : mode === 'create' ? 'Create project' : 'Save changes'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
            </div>
        </form>
    )
}
