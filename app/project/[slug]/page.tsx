"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink } from "lucide-react"
import { useParams } from "next/navigation"
import NotFound from "@/components/notFound"
import { useEffect, useRef } from "react"
import {ProjectType} from "@/models/projectContent";
import {voltContent} from "@/lib/content";


export default function ProjectDetailPage() {
    const projectData:ProjectType[] = [
        {
            "title": "Volt",
            "logo": "/images/volt/logo.png",
            "content": voltContent,
            "downloadUrl": "asd"
        }
    ]
    const { slug } = useParams()
    const data: ProjectType | undefined = projectData.find(
        (x) => x.title.toLowerCase() === slug
    )

    const sectionsRef = useRef<(HTMLElement | null)[]>([])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("animate-fade-in-up")
                        observer.unobserve(entry.target) // Animate once
                    }
                })
            },
            { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
        )

        sectionsRef.current.forEach((section) => {
            if (section) observer.observe(section)
        })

        return () => observer.disconnect()
    }, [])

    if (!data) return <NotFound />

    const { title, logo, content, downloadUrl } = data

    const parseBlocks = (data: string) => {
        const blocks: { type: "text" | "img" | "link"; content: string; href?: string }[] = []
        const regex =
            /<text>([\s\S]*?)<\/text>|<img>(.*?)<\/img>|<link href="(.*?)">(.*?)<\/link>/g

        let match
        while ((match = regex.exec(data)) !== null) {
            if (match[1]) {
                blocks.push({ type: "text", content: match[1].trim() })
            } else if (match[2]) {
                blocks.push({ type: "img", content: match[2].trim() })
            } else if (match[3] && match[4]) {
                blocks.push({ type: "link", href: match[3].trim(), content: match[4].trim() })
            }
        }

        return blocks
    }

    const renderTextWithLinks = (text: string) => {
        const parts: (string | { href: string; label: string })[] = []
        const regex = /<a href="(.*?)">(.*?)<\/a>/g

        let lastIndex = 0
        let match
        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(text.slice(lastIndex, match.index))
            }
            parts.push({ href: match[1], label: match[2] })
            lastIndex = regex.lastIndex
        }

        if (lastIndex < text.length) {
            parts.push(text.slice(lastIndex))
        }

        return (
            <p>
                {parts.map((part, idx) =>
                    typeof part === "string" ? (
                        part
                    ) : (
                        <a
                            key={idx}
                            href={part.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-4 hover:text-primary transition-colors"
                        >
                            {part.label}
                        </a>
                    )
                )}
            </p>
        )
    }

    const blocks = parseBlocks(content)

    return (
        <div className="min-h-screen bg-background text-foreground px-6 sm:px-8 lg:px-24 py-16 max-w-4xl mx-auto">
            {/* Header Section */}
            <div
                ref={(el) => {sectionsRef.current[0] = el}}
                className="opacity-0 translate-y-8 transition-all duration-700"
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
                    <div className="flex gap-4 sm:gap-6">
                        {logo && (
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 self-end items-end">
                                <Image
                                    src={logo}
                                    alt={`${title} logo`}
                                    fill
                                    className="object-contain p-2"
                                />
                            </div>
                        )}
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
                            {title}
                        </h1>
                    </div>
                    {downloadUrl && (
                        <div className="flex items-center">
                            <Button
                                asChild
                                variant="outline"
                                className="flex items-center gap-2 whitespace-nowrap"
                            >
                                <a href={downloadUrl} download>
                                    <Download className="w-4 h-4" /> Download
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Blocks */}
            <div className="space-y-10 leading-relaxed text-lg">
                {blocks.map((block, idx) => {
                    if (block.type === "text") {
                        return (
                            <div
                                key={idx}
                                ref={(el) => {sectionsRef.current[idx + 1] = el}}
                                className="opacity-0 translate-y-8 transition-all duration-700"
                            >
                                {renderTextWithLinks(block.content)}
                            </div>
                        )
                    }

                    if (block.type === "img") {
                        return (
                            <div
                                key={idx}
                                ref={(el) => {sectionsRef.current[idx + 1] = el}}
                                className="opacity-0 translate-y-8 transition-all duration-700 relative w-full aspect-[16/9] rounded-2xl overflow-hidden"
                            >
                                <Image
                                    src={block.content}
                                    alt={`Project image ${idx + 1}`}
                                    fill
                                    className="object-contain p-4"
                                />
                            </div>
                        )
                    }

                    if (block.type === "link") {
                        return (
                            <div
                                key={idx}
                                ref={(el) => {sectionsRef.current[idx + 1] = el}}
                                className="opacity-0 translate-y-8 transition-all duration-700"
                            >
                                <Button
                                    asChild
                                    variant="outline"
                                    className="flex items-center gap-2 whitespace-nowrap"
                                >
                                    <a href={block.href} target="_blank" rel="noopener noreferrer">
                                        {block.content}
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </Button>
                            </div>
                        )
                    }
                })}
            </div>
        </div>
    )
}
