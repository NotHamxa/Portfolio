"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink, ArrowLeft } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import NotFound from "@/components/notFound"
import { useEffect, useRef, useState } from "react"
import { ProjectType } from "@/models/projectContent"
import DownloadModal from "@/components/downloadModal"
import GithubModal from "@/components/githubModal"

export default function ProjectDetailPage() {
    const router = useRouter()
    const { slug } = useParams()

    const [data, setData] = useState<ProjectType | null | undefined>(undefined)

    useEffect(() => {
        fetch(`/api/projects/${slug}`)
            .then(r => r.ok ? r.json() : null)
            .then(setData)
            .catch(() => setData(null))
    }, [slug])

    const sectionsRef = useRef<(HTMLElement | null)[]>([])
    const titleRef = useRef<HTMLDivElement | null>(null)
    const [showStickyHeader, setShowStickyHeader] = useState(false)
    const [downloadModalOpen, setDownloadModalOpen] = useState(false)
    const [githubModalOpen, setGithubModalOpen] = useState(false)

    const handleGithubClick = () => {
        if (!data?.githubUrl || data.githubUrl.length === 0) return
        if (data.githubUrl.length === 1) {
            window.open(data.githubUrl[0].link, '_blank', 'noopener,noreferrer')
        } else {
            setGithubModalOpen(true)
        }
    }

    useEffect(() => {
        if (!data) return
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("animate-fade-in-up")
                        observer.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
        )
        sectionsRef.current.forEach((section) => {
            if (section) observer.observe(section)
        })
        return () => observer.disconnect()
    }, [data])

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

    // Loading
    if (data === undefined) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-muted-foreground text-sm">Loading...</div>
            </div>
        )
    }

    if (data === null) return <NotFound />

    const { title, logo, content, downloadUrl, githubUrl } = data

    const parseBlocks = (raw: string) => {
        const blocks: {
            type: "text" | "img" | "link" | "heading" | "imgText"
            content: string
            href?: string
            imgSrc?: string
            imgPosition?: "left" | "right"
        }[] = []

        const regex =
            /<imgText position="(left|right)" src="(.*?)">([\s\S]*?)<\/imgText>|<text>([\s\S]*?)<\/text>|<img>(.*?)<\/img>|<link href="(.*?)">(.*?)<\/link>|<heading>([\s\S]*?)<\/heading>/g

        let match
        while ((match = regex.exec(raw)) !== null) {
            if (match[1] && match[2] && match[3]) {
                blocks.push({ type: "imgText", imgPosition: match[1] as "left" | "right", imgSrc: match[2].trim(), content: match[3].trim() })
            } else if (match[4] !== undefined) {
                blocks.push({ type: "text", content: match[4].trim() })
            } else if (match[5] !== undefined) {
                blocks.push({ type: "img", content: match[5].trim() })
            } else if (match[6] && match[7] !== undefined) {
                blocks.push({ type: "link", href: match[6].trim(), content: match[7].trim() })
            } else if (match[8] !== undefined) {
                blocks.push({ type: "heading", content: match[8].trim() })
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
            if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
            parts.push({ href: match[1], label: match[2] })
            lastIndex = regex.lastIndex
        }
        if (lastIndex < text.length) parts.push(text.slice(lastIndex))
        return (
            <>
                {parts.map((part, idx) =>
                    typeof part === "string" ? (
                        <span key={idx}>{part}</span>
                    ) : (
                        <a key={idx} href={part.href} target="_blank" rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors font-medium">
                            {part.label}
                        </a>
                    )
                )}
            </>
        )
    }

    const blocks = parseBlocks(content)

    return (
        <>
            <DownloadModal visible={downloadModalOpen} setVisible={setDownloadModalOpen} links={downloadUrl} />
            <GithubModal visible={githubModalOpen} setVisible={setGithubModalOpen} repos={githubUrl || []} />

            {/* Floating Header */}
            <div className={`fixed left-0 right-0 top-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 transition-all duration-500 ease-out ${showStickyHeader ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/80 backdrop-blur-md px-4 sm:px-6 py-3 shadow-lg">
                        <div className="flex items-center gap-3">
                            {logo && (
                                <div className="relative w-8 h-8 rounded-md overflow-hidden border border-border">
                                    <Image src={logo} alt={`${title} logo`} fill className="object-contain p-1" />
                                </div>
                            )}
                            <span className="text-lg font-medium tracking-tight">{title}</span>
                        </div>
                        <div className="flex gap-2">
                            {downloadUrl && (
                                <Button variant="outline" size="sm" className="gap-2" onClick={() => setDownloadModalOpen(true)}>
                                    <Download className="w-4 h-4" />
                                    <span className="hidden sm:inline">Download</span>
                                </Button>
                            )}
                            {githubUrl && githubUrl.length > 0 && (
                                <Button variant="outline" size="sm" className="gap-2" onClick={handleGithubClick}>
                                    <GithubIcon className="w-4 h-4" />
                                    <span className="hidden sm:inline">GitHub</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-linear-to-b from-muted/50 to-background">
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
                    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 sm:py-32">
                        <div ref={titleRef} className="relative">
                            <Button variant="ghost" onClick={() => router.back()} className="mb-8 gap-2 hover:gap-3 transition-all">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Projects
                            </Button>

                            <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
                                {logo && (
                                    <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-2xl overflow-hidden bg-card border border-border shadow-2xl mx-auto lg:mx-0">
                                        <Image src={logo} alt={`${title} logo`} fill className="object-contain p-4" />
                                    </div>
                                )}
                                <div className="flex-1 text-center lg:text-left">
                                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">{title}</h1>
                                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                                        {downloadUrl && (
                                            <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-shadow" onClick={() => setDownloadModalOpen(true)}>
                                                <Download className="w-5 h-5" /> Download
                                            </Button>
                                        )}
                                        {githubUrl && githubUrl.length > 0 && (
                                            <Button variant="outline" size="lg" className="gap-2" onClick={handleGithubClick}>
                                                <GithubIcon className="w-5 h-5" />
                                                View on GitHub
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-24">
                    <div className="space-y-16 lg:space-y-24">
                        {blocks.map((block, idx) => {
                            if (block.type === "text") {
                                return (
                                    <div key={idx} ref={(el) => { sectionsRef.current[idx] = el }}
                                        className="opacity-0 translate-y-8 transition-all duration-700">
                                        <div className="prose prose-lg max-w-none">
                                            <p className="text-lg leading-relaxed text-muted-foreground">
                                                {renderTextWithLinks(block.content)}
                                            </p>
                                        </div>
                                    </div>
                                )
                            }

                            if (block.type === "heading") {
                                return (
                                    <div key={idx} ref={(el) => { sectionsRef.current[idx] = el }}
                                        className="opacity-0 translate-y-8 transition-all duration-700">
                                        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                            {block.content}
                                        </h2>
                                        <div className="h-1 w-20 bg-primary rounded-full" />
                                    </div>
                                )
                            }

                            if (block.type === "img") {
                                return (
                                    <div key={idx} ref={(el) => { sectionsRef.current[idx] = el }}
                                        className="opacity-0 translate-y-8 transition-all duration-700">
                                        <div className="relative w-full rounded-3xl overflow-hidden border border-border shadow-2xl bg-card/50 backdrop-blur-sm flex items-center justify-center p-8">
                                            <div className="relative w-full max-w-5xl">
                                                <Image src={block.content} alt={`Project screenshot ${idx + 1}`}
                                                    width={1920} height={1080}
                                                    className="w-full h-auto object-contain rounded-lg"
                                                    style={{ maxHeight: '70vh' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            if (block.type === "imgText") {
                                const isImageLeft = block.imgPosition === "left"
                                return (
                                    <div key={idx} ref={(el) => { sectionsRef.current[idx] = el }}
                                        className="opacity-0 translate-y-8 transition-all duration-700">
                                        <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${isImageLeft ? "" : "lg:grid-flow-dense"}`}>
                                            <div className={`relative rounded-2xl overflow-hidden border border-border shadow-xl bg-card/50 backdrop-blur-sm flex items-center justify-center p-6 ${isImageLeft ? "" : "lg:col-start-2"}`}>
                                                <div className="relative w-full max-w-md mx-auto">
                                                    <Image src={block.imgSrc || ""} alt="Feature illustration"
                                                        width={800} height={600}
                                                        className="w-full h-auto object-contain rounded-lg"
                                                        style={{ maxHeight: '600px' }}
                                                    />
                                                </div>
                                            </div>
                                            <div className={isImageLeft ? "" : "lg:col-start-1 lg:row-start-1"}>
                                                <div className="prose prose-lg max-w-none">
                                                    <p className="text-lg leading-relaxed text-muted-foreground">
                                                        {renderTextWithLinks(block.content)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            if (block.type === "link") {
                                return (
                                    <div key={idx} ref={(el) => { sectionsRef.current[idx] = el }}
                                        className="opacity-0 translate-y-8 transition-all duration-700">
                                        <Button asChild variant="outline" size="lg" className="gap-2 group">
                                            <a href={block.href} target="_blank" rel="noopener noreferrer">
                                                {block.content}
                                                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </a>
                                        </Button>
                                    </div>
                                )
                            }

                            return null
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}

const GithubIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.38.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.1-.75.08-.74.08-.74 1.22.09 1.86 1.25 1.86 1.25 1.08 1.85 2.83 1.32 3.52 1.01.11-.78.42-1.32.76-1.63-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.53.12-3.19 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.89.12 3.19.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.47 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.88-.01 3.27 0 .32.21.7.82.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
)
