"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink } from "lucide-react"
import { useParams } from "next/navigation"
import NotFound from "@/components/notFound"
import { useEffect, useRef, useState } from "react"
import { ProjectType } from "@/models/projectContent"
import { epsilonContent, voltContent } from "@/lib/content"
import DownloadModal from "@/components/downloadModal";

export default function ProjectDetailPage() {
    const projectData: ProjectType[] = [
        {
            title: "Volt",
            logo: "/images/volt/logo.png",
            content: voltContent,
            downloadUrl:{
                "windows":"https://boyijeqhff9mnkdi.public.blob.vercel-storage.com/Volt%20Setup.exe"
            }
        },
        {
            title: "Epsilon",
            logo: "/images/epsilon/logo.png",
            content: epsilonContent,
            downloadUrl: null,
        },
    ]

    const { slug } = useParams()
    const data: ProjectType | undefined = projectData.find(
        (x) => x.title.toLowerCase() === slug
    )

    const sectionsRef = useRef<(HTMLElement | null)[]>([])
    const titleRef = useRef<HTMLDivElement | null>(null)
    const [showStickyHeader, setShowStickyHeader] = useState(false)
    const [downloadModalOpen, setDownloadModalOpen] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("animate-fade-in-up")
                        observer.unobserve(entry.target)
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

    useEffect(() => {
        const handleScroll = () => {
            if (titleRef.current) {
                const rect = titleRef.current.getBoundingClientRect()
                setShowStickyHeader(rect.bottom < 100)
            }
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    if (!data) return <NotFound />

    const { title, logo, content, downloadUrl } = data

    const parseBlocks = (data: string) => {
        const blocks: {
            type: "text" | "img" | "link" | "heading"
            content: string
            href?: string
        }[] = []

        const regex =
            /<text>([\s\S]*?)<\/text>|<img>(.*?)<\/img>|<link href="(.*?)">(.*?)<\/link>|<heading>([\s\S]*?)<\/heading>/g

        let match
        while ((match = regex.exec(data)) !== null) {
            if (match[1]) {
                blocks.push({ type: "text", content: match[1].trim() })
            } else if (match[2]) {
                blocks.push({ type: "img", content: match[2].trim() })
            } else if (match[3] && match[4]) {
                blocks.push({
                    type: "link",
                    href: match[3].trim(),
                    content: match[4].trim(),
                })
            } else if (match[5]) {
                blocks.push({ type: "heading", content: match[5].trim() })
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
        <>
            <DownloadModal
                visible={downloadModalOpen}
                setVisible={setDownloadModalOpen}
                links={downloadUrl}
            />
        <div className="min-h-screen bg-background text-foreground px-6 sm:px-8 lg:px-24 py-16 max-w-4xl mx-auto relative">
            <div
                className={`fixed inset-x-0 top-4 z-50 transition-all duration-500 ease-out flex justify-center ${
                    showStickyHeader
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
                }`}
            >
                <div className="w-full max-w-4xl mx-4 sm:mx-6 lg:mx-8">
                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/80 backdrop-blur-md px-4 py-2 shadow-lg shadow-black/5">
                        <div className="flex items-center gap-3">
                            {logo && (
                                <div className="relative w-8 h-8 rounded-md overflow-hidden border border-border">
                                    <Image
                                        src={logo}
                                        alt={`${title} logo`}
                                        fill
                                        className="object-contain p-1"
                                    />
                                </div>
                            )}
                            <span className="text-lg font-medium tracking-tight">
                    {title}
                </span>
                        </div>
                        {downloadUrl && (
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={()=>setDownloadModalOpen(true)}
                            >
                                <label>
                                    <Download className="w-4 h-4" /> Download
                                </label>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div
                ref={titleRef}
                className="translate-y-8 transition-all duration-700"
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-center sm:text-left">
                        {logo && (
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto sm:mx-0 rounded-xl overflow-hidden border border-border">
                                <Image
                                    src={logo}
                                    alt={`${title} logo`}
                                    fill
                                    className="object-contain p-2"
                                />
                            </div>
                        )}
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight mt-2 sm:mt-0">
                            {title}
                        </h1>
                    </div>
                    {downloadUrl && (
                        <div className="flex justify-center sm:justify-end">
                            <Button
                                asChild
                                variant="outline"
                                className="flex items-center gap-2 whitespace-nowrap"
                                onClick={()=>setDownloadModalOpen(true)}
                            >
                                <label>
                                <Download className="w-4 h-4" /> Download
                                </label>

                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <div className="space-y-10 leading-relaxed text-lg">
                {blocks.map((block, idx) => {
                    if (block.type === "text") {
                        return (
                            <div
                                key={idx}
                                ref={(el) => {
                                    sectionsRef.current[idx + 1] = el
                                }}
                                className="opacity-0 translate-y-8 transition-all duration-700"
                            >
                                {renderTextWithLinks(block.content)}
                            </div>
                        )
                    }
                    if (block.type === "heading") {
                        return (
                            <div
                                key={idx}
                                ref={(el) => {
                                    sectionsRef.current[idx + 1] = el
                                }}
                                className="opacity-0 translate-y-8 transition-all duration-700"
                            >
                                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4 mt-8">
                                    {block.content}
                                </h2>
                            </div>
                        )
                    }
                    if (block.type === "img") {
                        return (
                            <div
                                key={idx}
                                ref={(el) => {
                                    sectionsRef.current[idx + 1] = el
                                }}
                                className="opacity-0 translate-y-8 transition-all duration-700 relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-border"
                            >
                                <Image
                                    src={block.content}
                                    alt={`Project image ${idx + 1}`}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        )
                    }
                    if (block.type === "link") {
                        return (
                            <div
                                key={idx}
                                ref={(el) => {
                                    sectionsRef.current[idx + 1] = el
                                }}
                                className="opacity-0 translate-y-8 transition-all duration-700"
                            >
                                <Button
                                    asChild
                                    variant="outline"
                                    className="flex items-center gap-2 whitespace-nowrap"
                                >
                                    <a
                                        href={block.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
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
        </>
    )
}
