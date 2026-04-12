"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Upload, Loader2, FolderOpen, ArrowLeft,
    Check, Trash2, Pencil, X, ImageIcon,
} from 'lucide-react'

interface BlobItem {
    url: string
    pathname: string
    size: number
    uploadedAt: string
}

interface Props {
    open: boolean
    onClose: () => void
    onSelect?: (url: string) => void
    /** When true, shows a "Select" button. Otherwise browse-only. */
    selectable?: boolean
}

function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFolders(blobs: BlobItem[]): string[] {
    const folders = new Set<string>()
    for (const b of blobs) {
        const parts = b.pathname.split('/')
        if (parts.length > 1) {
            folders.add(parts[0])
        }
    }
    return [...folders].sort()
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

export default function ImageBrowser({ open, onClose, onSelect, selectable = false }: Props) {
    const [blobs, setBlobs] = useState<BlobItem[]>([])
    const [loading, setLoading] = useState(true)
    const [folder, setFolder] = useState<string | null>(null)
    const [selected, setSelected] = useState<string | null>(null)
    const [preview, setPreview] = useState<BlobItem | null>(null)
    const [uploading, setUploading] = useState(false)
    const [renaming, setRenaming] = useState<BlobItem | null>(null)
    const [renameValue, setRenameValue] = useState('')
    const [deleting, setDeleting] = useState<string | null>(null)
    const [error, setError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

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

    useEffect(() => {
        if (open) {
            fetchBlobs()
            setSelected(null)
            setPreview(null)
            setFolder(null)
        }
    }, [open, fetchBlobs])

    async function handleUpload(file: File) {
        if (!file.type.startsWith('image/')) return
        setUploading(true)
        setError('')
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', folder || 'images')
        try {
            const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
            if (!res.ok) {
                const d = await res.json()
                setError(d.error || 'Upload failed')
                return
            }
            await fetchBlobs()
        } catch {
            setError('Upload failed')
        } finally {
            setUploading(false)
        }
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
            if (preview?.url === url) setPreview(null)
            if (selected === url) setSelected(null)
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
        } catch {
            setError('Rename failed')
        }
    }

    function getFilename(pathname: string) {
        return pathname.split('/').pop() || pathname
    }

    function navigateToFolder(sub: string) {
        setFolder(folder ? `${folder}/${sub}` : sub)
        setPreview(null)
        setSelected(null)
    }

    function navigateUp() {
        if (!folder) return
        const idx = folder.lastIndexOf('/')
        setFolder(idx === -1 ? null : folder.substring(0, idx))
        setPreview(null)
        setSelected(null)
    }

    const subfolders = getSubfolders(blobs, folder)
    const items = getItemsInFolder(blobs, folder)

    const breadcrumbs = folder ? folder.split('/') : []

    return (
        <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
            <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle>
                            {selectable ? 'Select an image' : 'Media Library'}
                        </DialogTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={uploading}
                                onClick={() => fileInputRef.current?.click()}
                                className="gap-1.5"
                            >
                                {uploading
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : <Upload className="w-3.5 h-3.5" />}
                                Upload
                            </Button>
                        </div>
                    </div>

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1 mt-2 text-sm">
                        <button
                            type="button"
                            onClick={() => { setFolder(null); setPreview(null); setSelected(null) }}
                            className={`hover:text-foreground transition-colors ${!folder ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                        >
                            All files
                        </button>
                        {breadcrumbs.map((crumb, i) => {
                            const path = breadcrumbs.slice(0, i + 1).join('/')
                            const isLast = i === breadcrumbs.length - 1
                            return (
                                <span key={path} className="flex items-center gap-1">
                                    <span className="text-muted-foreground/50">/</span>
                                    <button
                                        type="button"
                                        onClick={() => { setFolder(path); setPreview(null); setSelected(null) }}
                                        className={`hover:text-foreground transition-colors ${isLast ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                                    >
                                        {crumb}
                                    </button>
                                </span>
                            )
                        })}
                    </div>
                </DialogHeader>

                {error && (
                    <div className="px-6 py-2 bg-destructive/10">
                        <p className="text-xs text-destructive">{error}</p>
                    </div>
                )}

                <div className="flex flex-1 min-h-0">
                    {/* File grid */}
                    <ScrollArea className="flex-1">
                    <div className="p-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (subfolders.length === 0 && items.length === 0) ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                                <ImageIcon className="w-10 h-10" />
                                <p className="text-sm">No images here yet</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-2 gap-1.5"
                                >
                                    <Upload className="w-3.5 h-3.5" /> Upload an image
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {/* Back folder */}
                                {folder && (
                                    <button
                                        type="button"
                                        onClick={navigateUp}
                                        className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors aspect-square"
                                    >
                                        <ArrowLeft className="w-8 h-8 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">..</span>
                                    </button>
                                )}

                                {/* Subfolders */}
                                {subfolders.map(sub => (
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

                                {/* Image items */}
                                {items.map(blob => (
                                    <button
                                        key={blob.url}
                                        type="button"
                                        onClick={() => {
                                            setSelected(blob.url)
                                            setPreview(blob)
                                        }}
                                        className={`group relative flex flex-col rounded-lg border overflow-hidden transition-all aspect-square ${
                                            selected === blob.url
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
                                                sizes="150px"
                                            />
                                        </div>
                                        <div className="px-1.5 py-1 bg-background border-t border-border">
                                            <p className="text-[10px] text-muted-foreground truncate">
                                                {getFilename(blob.pathname)}
                                            </p>
                                        </div>
                                        {selected === blob.url && (
                                            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                <Check className="w-3 h-3 text-primary-foreground" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    </ScrollArea>

                    {/* Preview sidebar */}
                    {preview && (
                        <ScrollArea className="w-64 border-l border-border shrink-0 bg-muted/20">
                            <div className="p-4 space-y-4">
                                {/* Preview image */}
                                <div className="relative w-full aspect-square rounded-lg border border-border overflow-hidden bg-background">
                                    <Image
                                        src={preview.url}
                                        alt={getFilename(preview.pathname)}
                                        fill
                                        className="object-contain p-2"
                                        sizes="256px"
                                    />
                                </div>

                                {/* File info */}
                                <div className="space-y-2">
                                    {renaming?.url === preview.url ? (
                                        <div className="flex gap-1">
                                            <Input
                                                value={renameValue}
                                                onChange={e => setRenameValue(e.target.value)}
                                                className="h-7 text-xs"
                                                autoFocus
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') handleRename(preview)
                                                    if (e.key === 'Escape') setRenaming(null)
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="w-7 h-7 shrink-0"
                                                onClick={() => handleRename(preview)}
                                            >
                                                <Check className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="w-7 h-7 shrink-0"
                                                onClick={() => setRenaming(null)}
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-sm font-medium break-all">
                                            {getFilename(preview.pathname)}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">{formatSize(preview.size)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(preview.uploadedAt).toLocaleDateString()}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/60 break-all">{preview.pathname}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2">
                                    {selectable && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => { onSelect?.(preview.url); onClose() }}
                                            className="w-full gap-1.5"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                            Select
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setRenaming(preview)
                                            setRenameValue(getFilename(preview.pathname))
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
                                        onClick={() => {
                                            navigator.clipboard.writeText(preview.url)
                                        }}
                                        className="w-full gap-1.5"
                                    >
                                        Copy URL
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        disabled={deleting === preview.url}
                                        onClick={() => handleDelete(preview.url)}
                                        className="w-full gap-1.5"
                                    >
                                        {deleting === preview.url
                                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            : <Trash2 className="w-3.5 h-3.5" />}
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                        const f = e.target.files?.[0]
                        if (f) handleUpload(f)
                        e.target.value = ''
                    }}
                />
            </DialogContent>
        </Dialog>
    )
}
