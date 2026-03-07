"use client"

import { useState } from 'react'
import Image from 'next/image'

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

const TAGS_REFERENCE = `Available tags:

<text>Your paragraph text here</text>

<heading>Section Title</heading>

<img>/images/project/image.png</img>

<imgText position="left" src="/images/project/img.png">
  Text alongside the image
</imgText>

<imgText position="right" src="/images/project/img.png">
  Text alongside the image (image on right)
</imgText>

<link href="https://example.com">Link label</link>`

export default function ContentEditor({ value, onChange }: Props) {
    const [tab, setTab] = useState<'edit' | 'preview' | 'reference'>('edit')

    return (
        <div className="border border-border rounded-lg overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-border bg-muted/30">
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

            {/* Edit */}
            {tab === 'edit' && (
                <textarea
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full min-h-96 p-4 font-mono text-sm bg-background text-foreground resize-y focus:outline-none"
                    placeholder={`<text>\nYour intro paragraph here.\n</text>\n\n<heading>\nSection Title\n</heading>`}
                    spellCheck={false}
                />
            )}

            {/* Preview */}
            {tab === 'preview' && (
                <div className="p-6 min-h-96 bg-background">
                    <ContentPreview content={value} />
                </div>
            )}

            {/* Reference */}
            {tab === 'reference' && (
                <div className="p-4 min-h-96 bg-background">
                    <pre className="font-mono text-sm text-muted-foreground whitespace-pre-wrap">{TAGS_REFERENCE}</pre>
                </div>
            )}
        </div>
    )
}
