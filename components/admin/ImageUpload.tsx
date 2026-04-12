"use client"

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Upload, X, Loader2, FolderOpen } from 'lucide-react'
import ImageBrowser from './ImageBrowser'

interface Props {
    value: string
    onChange: (url: string) => void
    folder?: string
    label?: string
    compact?: boolean
}

export default function ImageUpload({ value, onChange, folder = 'images', label, compact = false }: Props) {
    const [uploading, setUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const [error, setError] = useState('')
    const [browserOpen, setBrowserOpen] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const upload = useCallback(async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('File must be an image')
            return
        }

        setUploading(true)
        setError('')

        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', folder)

        try {
            const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Upload failed')
                return
            }

            onChange(data.url)
        } catch {
            setError('Upload failed')
        } finally {
            setUploading(false)
        }
    }, [folder, onChange])

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) upload(file)
    }

    function handlePaste(e: React.ClipboardEvent) {
        const file = e.clipboardData.files[0]
        if (file) upload(file)
    }

    if (compact) {
        return (
            <div className="space-y-1">
                {label && <span className="text-xs text-muted-foreground">{label}</span>}
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" disabled={uploading}
                        onClick={() => inputRef.current?.click()} className="gap-1.5 shrink-0">
                        {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        Upload
                    </Button>
                    <Button type="button" variant="outline" size="sm"
                        onClick={() => setBrowserOpen(true)} className="gap-1.5 shrink-0">
                        <FolderOpen className="w-3 h-3" /> Browse
                    </Button>
                    {value && (
                        <div className="relative w-8 h-8 rounded border border-border overflow-hidden shrink-0">
                            <Image src={value} alt="Preview" fill className="object-cover" />
                        </div>
                    )}
                    {error && <span className="text-xs text-destructive">{error}</span>}
                </div>
                <input ref={inputRef} type="file" accept="image/*" className="hidden"
                    onChange={e => { if (e.target.files?.[0]) upload(e.target.files[0]) }} />
                <ImageBrowser
                    open={browserOpen}
                    onClose={() => setBrowserOpen(false)}
                    selectable
                    onSelect={onChange}
                />
            </div>
        )
    }

    return (
        <div className="space-y-2" onPaste={handlePaste}>
            {label && <span className="text-sm font-medium">{label}</span>}

            {value ? (
                <div className="relative rounded-lg border border-border overflow-hidden bg-card/50 group">
                    <div className="relative w-full aspect-video flex items-center justify-center p-4">
                        <Image
                            src={value}
                            alt="Preview"
                            width={800}
                            height={450}
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button type="button" variant="secondary" size="icon" className="w-7 h-7"
                            onClick={() => setBrowserOpen(true)}>
                            <FolderOpen className="w-3.5 h-3.5" />
                        </Button>
                        <Button type="button" variant="secondary" size="icon" className="w-7 h-7"
                            onClick={() => inputRef.current?.click()} disabled={uploading}>
                            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        </Button>
                        <Button type="button" variant="secondary" size="icon" className="w-7 h-7"
                            onClick={() => onChange('')}>
                            <X className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                    <div className="px-3 py-1.5 border-t border-border bg-muted/30">
                        <p className="text-xs text-muted-foreground truncate">{value}</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    <div
                        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors ${
                            dragOver
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-muted-foreground/50'
                        }`}
                    >
                        {uploading ? (
                            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                        ) : (
                            <Upload className="w-8 h-8 text-muted-foreground" />
                        )}
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                {uploading ? 'Uploading...' : 'Drop an image here or click to upload'}
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, GIF, WebP</p>
                        </div>
                    </div>
                    <Button type="button" variant="outline" size="sm"
                        onClick={() => setBrowserOpen(true)} className="gap-1.5">
                        <FolderOpen className="w-3.5 h-3.5" /> Browse existing images
                    </Button>
                </div>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}

            <input ref={inputRef} type="file" accept="image/*" className="hidden"
                onChange={e => { if (e.target.files?.[0]) upload(e.target.files[0]) }} />
            <ImageBrowser
                open={browserOpen}
                onClose={() => setBrowserOpen(false)}
                selectable
                onSelect={onChange}
            />
        </div>
    )
}
