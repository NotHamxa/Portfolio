"use client"

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Upload, Loader2, ImageIcon, FolderOpen, ArrowLeftRight, X } from 'lucide-react'
import {
    Dialog, DialogContent,
} from '@/components/ui/dialog'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import ImageBrowser from './ImageBrowser'

interface Props {
    value: string
    onChange: (v: string) => void
}

type Block =
    | { type: 'text'; content: string }
    | { type: 'heading'; content: string }
    | { type: 'img'; content: string }
    | { type: 'link'; content: string; href: string }
    | { type: 'imgText'; content: string; imgSrc: string; imgPosition: 'left' | 'right' }

function parseBlocks(data: string): Block[] {
    const blocks: Block[] = []
    const regex =
        /<imgText position="(left|right)" src="(.*?)">([\s\S]*?)<\/imgText>|<text>([\s\S]*?)<\/text>|<img>(.*?)<\/img>|<link href="(.*?)">(.*?)<\/link>|<heading>([\s\S]*?)<\/heading>/g
    let match
    while ((match = regex.exec(data)) !== null) {
        if (match[1] && match[2] && match[3]) {
            blocks.push({ type: 'imgText', imgPosition: match[1] as 'left' | 'right', imgSrc: match[2].trim(), content: match[3].trim() })
        } else if (match[4] !== undefined) {
            blocks.push({ type: 'text', content: match[4].trim() })
        } else if (match[5] !== undefined) {
            blocks.push({ type: 'img', content: match[5].trim() })
        } else if (match[6] && match[7] !== undefined) {
            blocks.push({ type: 'link', href: match[6].trim(), content: match[7].trim() })
        } else if (match[8] !== undefined) {
            blocks.push({ type: 'heading', content: match[8].trim() })
        }
    }
    return blocks
}

function ContentPreview({ content }: { content: string }) {
    const blocks = parseBlocks(content)

    if (blocks.length === 0) {
        return (
            <div className="text-muted-foreground text-sm italic text-center py-12">
                Nothing to preview yet. Add some tags in the editor.
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {blocks.map((block, idx) => {
                if (block.type === 'text') {
                    return (
                        <p key={idx} className="text-muted-foreground leading-relaxed">
                            {block.content}
                        </p>
                    )
                }
                if (block.type === 'heading') {
                    return (
                        <div key={idx}>
                            <h2 className="text-2xl font-bold tracking-tight mb-2">{block.content}</h2>
                            <div className="h-0.5 w-12 bg-primary rounded-full" />
                        </div>
                    )
                }
                if (block.type === 'img') {
                    return (
                        <div key={idx} className="relative w-full rounded-xl overflow-hidden border border-border bg-card/50 flex items-center justify-center p-4">
                            <Image
                                src={block.content}
                                alt="Preview"
                                width={1920}
                                height={1080}
                                className="w-full h-auto object-contain rounded-lg max-h-64"
                            />
                        </div>
                    )
                }
                if (block.type === 'imgText') {
                    const isLeft = block.imgPosition === 'left'
                    return (
                        <div key={idx} className={`grid sm:grid-cols-2 gap-6 items-center ${!isLeft ? 'sm:grid-flow-dense' : ''}`}>
                            <div className={`relative rounded-xl overflow-hidden border border-border bg-card/50 flex items-center justify-center p-4 ${!isLeft ? 'sm:col-start-2' : ''}`}>
                                <Image
                                    src={block.imgSrc}
                                    alt="Feature"
                                    width={800}
                                    height={600}
                                    className="w-full h-auto object-contain rounded-lg max-h-48"
                                />
                            </div>
                            <p className={`text-muted-foreground leading-relaxed ${!isLeft ? 'sm:col-start-1 sm:row-start-1' : ''}`}>
                                {block.content}
                            </p>
                        </div>
                    )
                }
                if (block.type === 'link') {
                    return (
                        <a key={idx} href={block.href} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
                            {block.content}
                        </a>
                    )
                }
                return null
            })}
        </div>
    )
}

/** Parse all image src positions out of content for the visual overlay */
interface ImageRef {
    url: string
    start: number
    end: number
    tag: 'img' | 'imgText'
}

function findImageRefs(content: string): ImageRef[] {
    const refs: ImageRef[] = []

    const imgRe = /<img>([\s\S]*?)<\/img>/g
    let m
    while ((m = imgRe.exec(content)) !== null) {
        const url = m[1].trim()
        const innerStart = m.index + '<img>'.length
        const leadingWs = m[1].length - m[1].trimStart().length
        refs.push({ url, start: innerStart + leadingWs, end: innerStart + leadingWs + url.length, tag: 'img' })
    }

    const srcRe = /<imgText[^>]*\ssrc="([^"]*)"[^>]*>/g
    while ((m = srcRe.exec(content)) !== null) {
        const url = m[1]
        const srcAttrStart = m[0].indexOf('src="') + 'src="'.length
        const absStart = m.index + srcAttrStart
        refs.push({ url, start: absStart, end: absStart + url.length, tag: 'imgText' })
    }

    return refs
}

const TAGS_REFERENCE = `Available tags:

<text>Your paragraph text here</text>

<heading>Section Title</heading>

<img>https://blob-url.vercel-storage.com/image.png</img>

<imgText position="left" src="https://blob-url.vercel-storage.com/image.png">
  Text alongside the image
</imgText>

<imgText position="right" src="https://blob-url.vercel-storage.com/image.png">
  Text alongside the image (image on right)
</imgText>

<link href="https://example.com">Link label</link>

Tip: Use the toolbar to upload new images or browse existing ones.
     Click on image thumbnails below the editor to swap them.`

type InsertMode = 'img' | 'imgText-left' | 'imgText-right'

export default function ContentEditor({ value, onChange }: Props) {
    const [tab, setTab] = useState<'edit' | 'preview' | 'reference'>('edit')
    const [uploading, setUploading] = useState(false)
    const [insertMode, setInsertMode] = useState<InsertMode | null>(null)
    const [error, setError] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Image browser state
    const [browserOpen, setBrowserOpen] = useState(false)
    const [browserCallback, setBrowserCallback] = useState<((url: string) => void) | null>(null)

    // Lightbox state
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
    const [lightboxRef, setLightboxRef] = useState<ImageRef | null>(null)

    function openBrowserForInsert(mode: InsertMode) {
        setBrowserCallback(() => (url: string) => {
            let tag: string
            if (mode === 'img') {
                tag = `<img>${url}</img>`
            } else {
                const pos = mode === 'imgText-left' ? 'left' : 'right'
                tag = `<imgText position="${pos}" src="${url}">\nYour description here\n</imgText>`
            }
            insertAtCursor(tag)
        })
        setBrowserOpen(true)
    }

    function openBrowserForReplace(ref: ImageRef) {
        setBrowserCallback(() => (newUrl: string) => {
            const newValue = value.substring(0, ref.start) + newUrl + value.substring(ref.end)
            onChange(newValue)
        })
        setBrowserOpen(true)
    }

    const insertAtCursor = useCallback((tag: string) => {
        const textarea = textareaRef.current
        if (!textarea) {
            onChange(value + '\n\n' + tag)
            return
        }

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const before = value.substring(0, start)
        const after = value.substring(end)

        const prefix = before.length > 0 && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : ''
        const suffix = after.length > 0 && !after.startsWith('\n\n') ? (after.startsWith('\n') ? '\n' : '\n\n') : ''

        const newValue = before + prefix + tag + suffix + after
        onChange(newValue)

        requestAnimationFrame(() => {
            const newPos = (before + prefix + tag).length
            textarea.selectionStart = textarea.selectionEnd = newPos
            textarea.focus()
        })
    }, [value, onChange])

    const uploadAndInsert = useCallback(async (file: File, mode: InsertMode) => {
        if (!file.type.startsWith('image/')) {
            setError('File must be an image')
            return
        }

        setUploading(true)
        setError('')

        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'content')

        try {
            const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Upload failed')
                return
            }

            const url = data.url
            let tag: string

            if (mode === 'img') {
                tag = `<img>${url}</img>`
            } else {
                const pos = mode === 'imgText-left' ? 'left' : 'right'
                tag = `<imgText position="${pos}" src="${url}">\nYour description here\n</imgText>`
            }

            insertAtCursor(tag)
        } catch {
            setError('Upload failed')
        } finally {
            setUploading(false)
        }
    }, [insertAtCursor])

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file && insertMode) {
            uploadAndInsert(file, insertMode)
        }
        e.target.value = ''
        setInsertMode(null)
    }

    function triggerUpload(mode: InsertMode) {
        setInsertMode(mode)
        fileInputRef.current?.click()
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) uploadAndInsert(file, 'img')
    }

    function handlePaste(e: React.ClipboardEvent) {
        const file = e.clipboardData.files[0]
        if (file) {
            e.preventDefault()
            uploadAndInsert(file, 'img')
        }
    }

    const imageRefs = findImageRefs(value)

    return (
        <div className="border border-border rounded-lg overflow-hidden">
            {/* Tab bar + toolbar combined */}
            <div className="flex items-center justify-between border-b border-border bg-muted/30">
                <div className="flex">
                    {(['edit', 'preview', 'reference'] as const).map(t => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setTab(t)}
                            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                                tab === t
                                    ? 'text-foreground border-b-2 border-foreground -mb-px bg-background'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Compact toolbar — only visible on edit tab */}
                {tab === 'edit' && (
                    <div className="flex items-center gap-1.5 pr-3">
                        <Button type="button" variant="ghost" size="icon" disabled={uploading}
                            onClick={() => triggerUpload('img')} className="w-7 h-7" title="Upload image">
                            <Upload className="w-3.5 h-3.5" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon"
                            onClick={() => openBrowserForInsert('img')} className="w-7 h-7" title="Browse images">
                            <FolderOpen className="w-3.5 h-3.5" />
                        </Button>
                        <div className="w-px h-4 bg-border mx-0.5" />
                        <Button type="button" variant="ghost" size="sm" disabled={uploading}
                            onClick={() => triggerUpload('imgText-left')} className="gap-1 h-7 text-xs px-2" title="Image left + text">
                            <ImageIcon className="w-3 h-3" /> L+T
                        </Button>
                        <Button type="button" variant="ghost" size="sm" disabled={uploading}
                            onClick={() => triggerUpload('imgText-right')} className="gap-1 h-7 text-xs px-2" title="Image right + text">
                            <ImageIcon className="w-3 h-3" /> R+T
                        </Button>
                        {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground ml-1" />}
                    </div>
                )}
            </div>

            {error && (
                <div className="px-3 py-1.5 bg-destructive/10 border-b border-destructive/20">
                    <p className="text-xs text-destructive">{error}</p>
                </div>
            )}

            {/* Edit */}
            {tab === 'edit' && (
                <div>
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        onDrop={handleDrop}
                        onDragOver={e => e.preventDefault()}
                        onPaste={handlePaste}
                        className="w-full min-h-80 p-4 font-mono text-sm bg-background text-foreground resize-y focus:outline-none scrollbar-thin"
                        placeholder={`<text>\nYour intro paragraph here.\n</text>\n\n<heading>Section Title</heading>`}
                        spellCheck={false}
                    />

                    {/* Image strip — horizontal thumbnails below editor */}
                    {imageRefs.length > 0 && (
                        <div className="border-t border-border bg-muted/10 px-3 py-2.5">
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-2">
                                Images ({imageRefs.length}) — click to enlarge
                            </p>
                            <ScrollArea className="w-full">
                                <div className="flex gap-2 pb-1">
                                    {imageRefs.map((ref, i) => (
                                        <div key={`${ref.start}-${i}`} className="shrink-0 w-24 rounded-md border border-border overflow-hidden hover:border-primary hover:ring-1 hover:ring-primary/30 transition-all group">
                                            <button
                                                type="button"
                                                onClick={() => { setLightboxUrl(ref.url); setLightboxRef(ref) }}
                                                className="relative w-full aspect-[4/3] bg-muted/30 cursor-zoom-in"
                                                title="Click to enlarge"
                                            >
                                                <Image
                                                    src={ref.url}
                                                    alt={`Image ${i + 1}`}
                                                    fill
                                                    className="object-contain p-0.5"
                                                    sizes="96px"
                                                />
                                            </button>
                                            <div className="flex items-center justify-between px-1 py-0.5 bg-background">
                                                <p className="text-[9px] text-muted-foreground truncate">
                                                    {ref.tag === 'img' ? 'img' : 'imgText'} #{i + 1}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => openBrowserForReplace(ref)}
                                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                                    title="Change image"
                                                >
                                                    <ArrowLeftRight className="w-2.5 h-2.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </div>
                    )}
                </div>
            )}

            {/* Preview */}
            {tab === 'preview' && (
                <ScrollArea className="h-[32rem] bg-background">
                    <div className="p-6">
                        <ContentPreview content={value} />
                    </div>
                </ScrollArea>
            )}

            {/* Reference */}
            {tab === 'reference' && (
                <ScrollArea className="h-80 bg-background">
                    <div className="p-4">
                        <pre className="font-mono text-sm text-muted-foreground whitespace-pre-wrap">{TAGS_REFERENCE}</pre>
                    </div>
                </ScrollArea>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
            />

            <ImageBrowser
                open={browserOpen}
                onClose={() => { setBrowserOpen(false); setBrowserCallback(null) }}
                selectable
                onSelect={(url) => {
                    browserCallback?.(url)
                    setBrowserCallback(null)
                }}
            />

            {/* Lightbox dialog */}
            <Dialog open={!!lightboxUrl} onOpenChange={v => { if (!v) { setLightboxUrl(null); setLightboxRef(null) } }}>
                <DialogContent className="sm:max-w-3xl p-0 gap-0 overflow-hidden bg-black/95 border-none">
                    <div className="relative flex items-center justify-center min-h-[50vh] max-h-[80vh]">
                        {lightboxUrl && (
                            <Image
                                src={lightboxUrl}
                                alt="Enlarged preview"
                                width={1920}
                                height={1080}
                                className="w-full h-auto max-h-[80vh] object-contain"
                            />
                        )}
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 bg-background border-t border-border">
                        <p className="text-xs text-muted-foreground truncate max-w-md">
                            {lightboxUrl ? new URL(lightboxUrl).pathname.slice(1) : ''}
                        </p>
                        <div className="flex gap-2">
                            {lightboxRef && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5"
                                    onClick={() => {
                                        const ref = lightboxRef
                                        setLightboxUrl(null)
                                        setLightboxRef(null)
                                        openBrowserForReplace(ref)
                                    }}
                                >
                                    <ArrowLeftRight className="w-3.5 h-3.5" />
                                    Change
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => { setLightboxUrl(null); setLightboxRef(null) }}
                            >
                                <X className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
