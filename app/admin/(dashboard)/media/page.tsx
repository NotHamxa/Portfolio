"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Upload, Loader2, FolderOpen, ArrowLeft,
    Trash2, Pencil, Check, X, ImageIcon, Search,
    FolderPlus,
} from 'lucide-react'

interface BlobItem {
    url: string
    pathname: string
    size: number
    uploadedAt: string
}

function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFilename(pathname: string) {
    return pathname.split('/').pop() || pathname
}

function getSubfolders(blobs: BlobItem[], parent: string | null): string[] {
    const subs = new Set<string>()
    const prefix = parent ? parent + '/' : ''
    for (const b of blobs) {
        if (!b.pathname.startsWith(prefix)) continue
        const rest = b.pathname.slice(prefix.length)
        const slashIdx = rest.indexOf('/')
        if (slashIdx > 0) {
            subs.add(rest.substring(0, slashIdx))
        }
    }
    return [...subs].sort()
}

function getItemsInFolder(blobs: BlobItem[], folder: string | null): BlobItem[] {
    if (!folder) {
        return blobs.filter(b => !b.pathname.includes('/') && !b.pathname.endsWith('.folder'))
    }
    return blobs.filter(b => {
        if (!b.pathname.startsWith(folder + '/')) return false
        const rest = b.pathname.slice(folder.length + 1)
        return !rest.includes('/') && !rest.endsWith('.folder')
    })
}

export default function MediaPage() {
    const [blobs, setBlobs] = useState<BlobItem[]>([])
    const [loading, setLoading] = useState(true)
    const [folder, setFolder] = useState<string | null>(null)
    const [selected, setSelected] = useState<BlobItem | null>(null)
    const [uploading, setUploading] = useState(false)
    const [renaming, setRenaming] = useState<BlobItem | null>(null)
    const [renameValue, setRenameValue] = useState('')
    const [deleting, setDeleting] = useState<string | null>(null)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [dragOver, setDragOver] = useState(false)
    const [creatingFolder, setCreatingFolder] = useState(false)
    const [newFolderName, setNewFolderName] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const folderInputRef = useRef<HTMLInputElement>(null)

    const fetchBlobs = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/blobs')
            const data = await res.json()
            setBlobs(data.blobs || [])
        } catch {
            setError('Failed to load images')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchBlobs() }, [fetchBlobs])

    async function handleUpload(files: FileList) {
        setUploading(true)
        setError('')
        for (const file of Array.from(files)) {
            if (!file.type.startsWith('image/')) continue
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', folder || 'images')
            try {
                const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
                if (!res.ok) {
                    const d = await res.json()
                    setError(d.error || 'Upload failed')
                }
            } catch {
                setError('Upload failed')
            }
        }
        setUploading(false)
        await fetchBlobs()
    }

    async function handleDelete(url: string) {
        setDeleting(url)
        try {
            await fetch('/api/admin/blobs', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            })
            setBlobs(prev => prev.filter(b => b.url !== url))
            if (selected?.url === url) setSelected(null)
        } catch {
            setError('Delete failed')
        } finally {
            setDeleting(null)
        }
    }

    async function handleRename(blob: BlobItem) {
        if (!renameValue.trim() || renameValue === getFilename(blob.pathname)) {
            setRenaming(null)
            return
        }
        setError('')
        const dir = blob.pathname.substring(0, blob.pathname.lastIndexOf('/') + 1)
        const newPathname = dir + renameValue.trim()
        try {
            const res = await fetch('/api/admin/blobs', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sourceUrl: blob.url, newPathname }),
            })
            if (!res.ok) {
                const d = await res.json()
                setError(d.error || 'Rename failed')
                return
            }
            await fetchBlobs()
            setRenaming(null)
            setSelected(null)
        } catch {
            setError('Rename failed')
        }
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        setDragOver(false)
        if (e.dataTransfer.files.length > 0) handleUpload(e.dataTransfer.files)
    }

    async function handleCreateFolder() {
        const name = newFolderName.trim()
        if (!name) {
            setCreatingFolder(false)
            return
        }
        setError('')
        const fullPath = folder ? `${folder}/${name}` : name
        try {
            const res = await fetch('/api/admin/blobs', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folder: fullPath }),
            })
            if (!res.ok) {
                const d = await res.json()
                setError(d.error || 'Failed to create folder')
                return
            }
            await fetchBlobs()
        } catch {
            setError('Failed to create folder')
        } finally {
            setCreatingFolder(false)
            setNewFolderName('')
        }
    }

    function navigateToFolder(sub: string) {
        setFolder(folder ? `${folder}/${sub}` : sub)
        setSelected(null)
    }

    function navigateUp() {
        if (!folder) return
        const idx = folder.lastIndexOf('/')
        setFolder(idx === -1 ? null : folder.substring(0, idx))
        setSelected(null)
    }

    const subfolders = getSubfolders(blobs, folder)
    let items = getItemsInFolder(blobs, folder)

    // Search filter — applies within current folder
    if (search) {
        const q = search.toLowerCase()
        items = items.filter(b => getFilename(b.pathname).toLowerCase().includes(q))
    }

    const breadcrumbs = folder ? folder.split('/') : []

    const visibleBlobs = blobs.filter(b => !b.pathname.endsWith('.folder'))
    const totalSize = visibleBlobs.reduce((a, b) => a + b.size, 0)

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Media</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {visibleBlobs.length} files &middot; {formatSize(totalSize)} total
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => { setCreatingFolder(true); setNewFolderName(''); requestAnimationFrame(() => folderInputRef.current?.focus()) }}
                        className="gap-1.5"
                    >
                        <FolderPlus className="w-4 h-4" />
                        New folder
                    </Button>
                    <Button
                        type="button"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-1.5"
                    >
                        {uploading
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Upload className="w-4 h-4" />}
                        Upload
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-4 px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            )}

            {/* Toolbar: breadcrumb + search */}
            <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-1 text-sm min-w-0">
                    <button
                        type="button"
                        onClick={() => { setFolder(null); setSelected(null) }}
                        className={`shrink-0 hover:text-foreground transition-colors ${!folder ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                    >
                        All files
                    </button>
                    {breadcrumbs.map((crumb, i) => {
                        const path = breadcrumbs.slice(0, i + 1).join('/')
                        const isLast = i === breadcrumbs.length - 1
                        return (
                            <span key={path} className="flex items-center gap-1 min-w-0">
                                <span className="text-muted-foreground/50 shrink-0">/</span>
                                <button
                                    type="button"
                                    onClick={() => { setFolder(path); setSelected(null) }}
                                    className={`truncate hover:text-foreground transition-colors ${isLast ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                                >
                                    {crumb}
                                </button>
                            </span>
                        )
                    })}
                </div>
                <div className="relative w-56 shrink-0">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search files..."
                        className="h-8 pl-8 text-sm"
                    />
                </div>
            </div>

            <div className="flex gap-6">
                {/* Main grid */}
                <div
                    className={`flex-1 min-w-0 rounded-lg border-2 border-dashed p-4 transition-colors ${
                        dragOver ? 'border-primary bg-primary/5' : 'border-transparent'
                    }`}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                >
                    {loading ? (
                        <div className="flex items-center justify-center py-32">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (subfolders.length === 0 && items.length === 0) ? (
                        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground gap-3">
                            <ImageIcon className="w-12 h-12" />
                            <p className="text-sm">
                                {search ? 'No files match your search' : 'No images here yet'}
                            </p>
                            {!search && (
                                <p className="text-xs text-muted-foreground/60">Drop files here or click Upload</p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                            {/* Back */}
                            {folder && !search && (
                                <button
                                    type="button"
                                    onClick={navigateUp}
                                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors aspect-square"
                                >
                                    <ArrowLeft className="w-8 h-8 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">..</span>
                                </button>
                            )}

                            {/* New folder input */}
                            {creatingFolder && !search && (
                                <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-primary ring-2 ring-primary/30 aspect-square">
                                    <FolderPlus className="w-8 h-8 text-muted-foreground" />
                                    <Input
                                        ref={folderInputRef}
                                        value={newFolderName}
                                        onChange={e => setNewFolderName(e.target.value)}
                                        placeholder="Name"
                                        className="h-6 text-xs text-center px-1"
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleCreateFolder()
                                            if (e.key === 'Escape') { setCreatingFolder(false); setNewFolderName('') }
                                        }}
                                        onBlur={() => {
                                            if (!newFolderName.trim()) { setCreatingFolder(false); setNewFolderName('') }
                                        }}
                                    />
                                    <div className="flex gap-1">
                                        <Button type="button" variant="ghost" size="icon" className="w-6 h-6"
                                            onClick={handleCreateFolder}>
                                            <Check className="w-3 h-3" />
                                        </Button>
                                        <Button type="button" variant="ghost" size="icon" className="w-6 h-6"
                                            onClick={() => { setCreatingFolder(false); setNewFolderName('') }}>
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Subfolders */}
                            {!search && subfolders.map(sub => (
                                <button
                                    key={sub}
                                    type="button"
                                    onClick={() => navigateToFolder(sub)}
                                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors aspect-square"
                                >
                                    <FolderOpen className="w-8 h-8 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground truncate w-full text-center">{sub}</span>
                                </button>
                            ))}

                            {/* Images */}
                            {items.map(blob => (
                                <button
                                    key={blob.url}
                                    type="button"
                                    onClick={() => setSelected(blob)}
                                    className={`group relative flex flex-col rounded-lg border overflow-hidden transition-all aspect-square ${
                                        selected?.url === blob.url
                                            ? 'border-primary ring-2 ring-primary/30'
                                            : 'border-border hover:border-muted-foreground/50'
                                    }`}
                                >
                                    <div className="flex-1 relative bg-muted/30">
                                        <Image
                                            src={blob.url}
                                            alt={getFilename(blob.pathname)}
                                            fill
                                            className="object-contain p-1"
                                            sizes="180px"
                                        />
                                    </div>
                                    <div className="px-1.5 py-1 bg-background border-t border-border">
                                        <p className="text-[10px] text-muted-foreground truncate">
                                            {getFilename(blob.pathname)}
                                        </p>
                                    </div>
                                    {selected?.url === blob.url && (
                                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                            <Check className="w-3 h-3 text-primary-foreground" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail sidebar */}
                {selected && (
                    <div className="w-72 shrink-0 rounded-lg border border-border bg-card p-4 space-y-4 self-start sticky top-20">
                        {/* Preview */}
                        <div className="relative w-full aspect-square rounded-lg border border-border overflow-hidden bg-muted/30">
                            <Image
                                src={selected.url}
                                alt={getFilename(selected.pathname)}
                                fill
                                className="object-contain p-3"
                                sizes="280px"
                            />
                        </div>

                        {/* Info */}
                        <div className="space-y-2">
                            {renaming?.url === selected.url ? (
                                <div className="flex gap-1">
                                    <Input
                                        value={renameValue}
                                        onChange={e => setRenameValue(e.target.value)}
                                        className="h-7 text-xs"
                                        autoFocus
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleRename(selected)
                                            if (e.key === 'Escape') setRenaming(null)
                                        }}
                                    />
                                    <Button type="button" variant="ghost" size="icon" className="w-7 h-7 shrink-0"
                                        onClick={() => handleRename(selected)}>
                                        <Check className="w-3 h-3" />
                                    </Button>
                                    <Button type="button" variant="ghost" size="icon" className="w-7 h-7 shrink-0"
                                        onClick={() => setRenaming(null)}>
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-sm font-medium break-all">{getFilename(selected.pathname)}</p>
                            )}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{formatSize(selected.size)}</span>
                                <span>{new Date(selected.uploadedAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground/60 break-all">{selected.pathname}</p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setRenaming(selected)
                                    setRenameValue(getFilename(selected.pathname))
                                }}
                                className="w-full gap-1.5"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                                Rename
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(selected.url)}
                                className="w-full gap-1.5"
                            >
                                Copy URL
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                disabled={deleting === selected.url}
                                onClick={() => handleDelete(selected.url)}
                                className="w-full gap-1.5"
                            >
                                {deleting === selected.url
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : <Trash2 className="w-3.5 h-3.5" />}
                                Delete
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => {
                    if (e.target.files?.length) handleUpload(e.target.files)
                    e.target.value = ''
                }}
            />
        </div>
    )
}
