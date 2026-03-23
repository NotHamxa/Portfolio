"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink, ArrowLeft, ArrowUp, Share2, Check, ChevronLeft, ChevronRight, X } from "lucide-react"
import { useParams } from "next/navigation"
import { usePageTransition } from "@/components/page-transition"
import NotFound from "@/components/notFound"
import { useCallback, useEffect, useRef, useState } from "react"
import { ProjectType } from "@/models/projectContent"
import DownloadModal from "@/components/downloadModal"
import GithubModal from "@/components/githubModal"

type Block = {
    type: "text" | "img" | "link" | "heading" | "imgText"
    content: string
    href?: string
    imgSrc?: string
    imgPosition?: "left" | "right"
}

export default function ProjectDetailPage() {
    const { push } = usePageTransition()
    const { slug } = useParams()

    const [data, setData] = useState<ProjectType | null | undefined>(undefined)
    const [allProjects, setAllProjects] = useState<ProjectType[]>([])

    useEffect(() => {
        fetch(`/api/projects/${slug}`)
            .then(r => r.ok ? r.json() : null)
            .then(setData)
            .catch(() => setData(null))
        fetch('/api/projects')
            .then(r => r.json())
            .then(setAllProjects)
            .catch(() => {})
    }, [slug])

    const sectionsRef = useRef<(HTMLElement | null)[]>([])
    const headingRefs = useRef<(HTMLElement | null)[]>([])
    const titleRef = useRef<HTMLDivElement | null>(null)
    const [showStickyHeader, setShowStickyHeader] = useState(false)
    const [downloadModalOpen, setDownloadModalOpen] = useState(false)
    const [githubModalOpen, setGithubModalOpen] = useState(false)
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [copied, setCopied] = useState(false)
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
    const [activeHeading, setActiveHeading] = useState(-1)

    const handleGithubClick = () => {
        if (!data?.githubUrl || data.githubUrl.length === 0) return
        if (data.githubUrl.length === 1) {
            window.open(data.githubUrl[0].link, '_blank', 'noopener,noreferrer')
        } else {
            setGithubModalOpen(true)
        }
    }

    // Intersection observer for fade-in
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

    // Scroll: progress bar, sticky header, scroll-to-top, active heading
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY
            setShowScrollTop(scrollTop > 400)

            if (titleRef.current) {
                const rect = titleRef.current.getBoundingClientRect()
                setShowStickyHeader(rect.bottom < 100)
            }

            // Active heading for TOC — find the last heading above the viewport center
            let current = -1
            const mid = window.innerHeight * 0.6
            headingRefs.current.forEach((el, i) => {
                if (el) {
                    const rect = el.getBoundingClientRect()
                    if (rect.top <= mid) current = i
                }
            })
            setActiveHeading(current)
        }
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Next/prev projects
    const currentIndex = allProjects.findIndex(p => p.id === slug)
    const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null
    const nextProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null

    // Keyboard shortcuts
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (lightboxSrc) {
                if (e.key === "Escape") setLightboxSrc(null)
                return
            }
            if (e.key === "ArrowLeft" && prevProject) push(`/project/${prevProject.id}`)
            if (e.key === "ArrowRight" && nextProject) push(`/project/${nextProject.id}`)
        }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [prevProject, nextProject, push, lightboxSrc])

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const copyLink = useCallback(async () => {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }, [])

    if (data === undefined) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-muted-foreground text-sm font-mono">Loading...</div>
            </div>
        )
    }

    if (data === null) return <NotFound />

    const { title, logo, content, downloadUrl, githubUrl, date } = data

    const parseBlocks = (raw: string): Block[] => {
        const blocks: Block[] = []
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
                            className="text-foreground underline underline-offset-4 decoration-accent/50 hover:decoration-accent transition-colors">
                            {part.label}
                        </a>
                    )
                )}
            </>
        )
    }

    const blocks = parseBlocks(content)
    const headings = blocks
        .map((b, i) => ({ ...b, blockIndex: i }))
        .filter(b => b.type === "heading")

    let headingCounter = 0

    return (
        <>
            <DownloadModal visible={downloadModalOpen} setVisible={setDownloadModalOpen} links={downloadUrl} />
            <GithubModal visible={githubModalOpen} setVisible={setGithubModalOpen} repos={githubUrl || []} />

            {/* Lightbox */}
            {lightboxSrc && (
                <div
                    className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm flex items-center justify-center cursor-zoom-out"
                    onClick={() => setLightboxSrc(null)}
                >
                    <button
                        onClick={() => setLightboxSrc(null)}
                        className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <Image
                        src={lightboxSrc}
                        alt="Zoomed image"
                        width={1920}
                        height={1080}
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Sticky header — full-width blur bar */}
            <div className={`fixed left-0 right-0 top-0 z-50 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${showStickyHeader ? "translate-y-0" : "-translate-y-full"}`}>
                <div className="bg-background/70 backdrop-blur-xl border-b border-border/50">
                    <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center h-14">
                        {/* Left — Back */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => push("/")}
                            className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Back</span>
                        </Button>

                        {/* Center — Logo + Title */}
                        <div className="flex-1 flex items-center justify-center gap-2.5">
                            {logo && (
                                <div className="relative w-6 h-6 rounded-md overflow-hidden border border-border shrink-0">
                                    <Image src={logo} alt={`${title} logo`} fill className="object-contain p-0.5" />
                                </div>
                            )}
                            <span className="text-sm font-medium tracking-tight truncate max-w-[200px] sm:max-w-none">{title}</span>
                        </div>

                        {/* Right — Actions */}
                        <div className="flex gap-1.5">
                            {downloadUrl && (
                                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => setDownloadModalOpen(true)}>
                                    <Download className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline text-xs">Download</span>
                                </Button>
                            )}
                            {githubUrl && githubUrl.length > 0 && (
                                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={handleGithubClick}>
                                    <GithubIcon className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline text-xs">GitHub</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Table of contents — desktop sidebar */}
            {headings.length > 1 && (
                <nav className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden xl:block">
                    <div className="flex flex-col gap-3">
                        {headings.map((h, i) => (
                            <button
                                key={i}
                                onClick={() => headingRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" })}
                                className={`text-right text-xs font-medium transition-all duration-500 max-w-[160px] truncate ${
                                    activeHeading === i
                                        ? "text-foreground"
                                        : "text-muted-foreground/40 hover:text-muted-foreground/70"
                                }`}
                            >
                                {h.content}
                            </button>
                        ))}
                    </div>
                </nav>
            )}

            <div className="min-h-screen bg-background">
                {/* Hero */}
                <div className="border-b border-border">
                    <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 sm:pt-24 pb-12 sm:pb-14">
                        <div ref={titleRef}>
                            {/* Back + Share row */}
                            <div className="flex items-center justify-between mb-10">
                                <Button
                                    variant="ghost"
                                    onClick={() => push("/")}
                                    className="-ml-3 gap-2 hover:gap-3 transition-all text-muted-foreground hover:text-foreground"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={copyLink}
                                    className="gap-2 text-muted-foreground hover:text-foreground"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                                    {copied ? "Copied" : "Share"}
                                </Button>
                            </div>

                            {/* Meta label */}
                            <p className="text-xs font-mono text-muted-foreground tracking-widest mb-5 uppercase">
                                Project{date ? ` / ${date}` : ""}
                            </p>

                            {/* Title */}
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.05] mb-10">
                                {title}
                            </h1>

                            {/* Divider */}
                            <div className="h-px w-full bg-border mb-8" />

                            {/* Logo + Actions row */}
                            <div className="flex items-center gap-4">
                                {logo && (
                                    <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-border bg-muted/20 shrink-0">
                                        <Image src={logo} alt={`${title} logo`} fill className="object-contain p-1.5" />
                                    </div>
                                )}
                                <div className="flex gap-2 ml-auto">
                                    {downloadUrl && (
                                        <Button variant="outline" size="sm" className="gap-2" onClick={() => setDownloadModalOpen(true)}>
                                            <Download className="w-4 h-4" />
                                            Download
                                        </Button>
                                    )}
                                    {githubUrl && githubUrl.length > 0 && (
                                        <Button variant="outline" size="sm" className="gap-2" onClick={handleGithubClick}>
                                            <GithubIcon className="w-4 h-4" />
                                            GitHub
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content blocks */}
                <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-24">
                    <div className="space-y-14 lg:space-y-20">
                        {blocks.map((block, idx) => {
                            const delay = idx * 60

                            if (block.type === "text") {
                                return (
                                    <div key={idx} ref={(el) => { sectionsRef.current[idx] = el }}
                                        className="opacity-0 translate-y-8 transition-all duration-700"
                                        style={{ transitionDelay: `${delay}ms` }}>
                                        <p className="text-base sm:text-lg leading-[1.85] text-muted-foreground max-w-2xl">
                                            {renderTextWithLinks(block.content)}
                                        </p>
                                    </div>
                                )
                            }

                            if (block.type === "heading") {
                                const hIdx = headingCounter++
                                return (
                                    <div key={idx}
                                        ref={(el) => {
                                            sectionsRef.current[idx] = el
                                            headingRefs.current[hIdx] = el
                                        }}
                                        className="opacity-0 translate-y-8 transition-all duration-700"
                                        style={{ transitionDelay: `${delay}ms` }}>
                                        <h2 className="text-2xl sm:text-3xl font-medium tracking-tight pl-4 border-l-2 border-foreground">
                                            {block.content}
                                        </h2>
                                    </div>
                                )
                            }

                            if (block.type === "img") {
                                return (
                                    <div key={idx} ref={(el) => { sectionsRef.current[idx] = el }}
                                        className="opacity-0 translate-y-8 transition-all duration-700"
                                        style={{ transitionDelay: `${delay}ms` }}>
                                        <div
                                            className="w-full rounded-2xl overflow-hidden border border-border bg-muted/10 cursor-zoom-in hover:border-muted-foreground/30 transition-colors duration-300"
                                            onClick={() => setLightboxSrc(block.content)}
                                        >
                                            <Image
                                                src={block.content}
                                                alt={`Project screenshot ${idx + 1}`}
                                                width={1920}
                                                height={1080}
                                                className="w-full h-auto object-contain"
                                                style={{ maxHeight: '70vh' }}
                                                placeholder="empty"
                                            />
                                        </div>
                                    </div>
                                )
                            }

                            if (block.type === "imgText") {
                                const isImageLeft = block.imgPosition === "left"
                                return (
                                    <div key={idx} ref={(el) => { sectionsRef.current[idx] = el }}
                                        className="opacity-0 translate-y-8 transition-all duration-700"
                                        style={{ transitionDelay: `${delay}ms` }}>
                                        <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${isImageLeft ? "" : "lg:grid-flow-dense"}`}>
                                            <div
                                                className={`w-full rounded-xl overflow-hidden border border-border bg-muted/10 cursor-zoom-in hover:border-muted-foreground/30 transition-colors duration-300 ${isImageLeft ? "" : "lg:col-start-2"}`}
                                                onClick={() => setLightboxSrc(block.imgSrc || "")}
                                            >
                                                <Image
                                                    src={block.imgSrc || ""}
                                                    alt="Feature illustration"
                                                    width={800}
                                                    height={600}
                                                    className="w-full h-auto object-contain"
                                                    style={{ maxHeight: '500px' }}
                                                    placeholder="empty"
                                                />
                                            </div>
                                            <div className={isImageLeft ? "" : "lg:col-start-1 lg:row-start-1"}>
                                                <p className="text-base sm:text-lg leading-[1.85] text-muted-foreground">
                                                    {renderTextWithLinks(block.content)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            if (block.type === "link") {
                                return (
                                    <div key={idx} ref={(el) => { sectionsRef.current[idx] = el }}
                                        className="opacity-0 translate-y-8 transition-all duration-700"
                                        style={{ transitionDelay: `${delay}ms` }}>
                                        <a
                                            href={block.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group inline-flex items-center gap-3 px-5 py-3 border border-border rounded-lg hover:border-foreground transition-all duration-300 text-sm font-medium"
                                        >
                                            {block.content}
                                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                                        </a>
                                    </div>
                                )
                            }

                            return null
                        })}
                    </div>
                </div>

                {/* Next / Previous project navigation */}
                {(prevProject || nextProject) && (
                    <div className="border-t border-border">
                        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16">
                            <div className="grid grid-cols-2 gap-4 sm:gap-8">
                                {prevProject ? (
                                    <button
                                        onClick={() => push(`/project/${prevProject.id}`)}
                                        className="group flex items-center gap-3 py-4 pr-4 text-left"
                                    >
                                        <ChevronLeft className="w-5 h-5 shrink-0 text-muted-foreground group-hover:-translate-x-1 group-hover:text-foreground transition-all duration-300" />
                                        <div className="min-w-0">
                                            <div className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-1">Previous</div>
                                            <div className="text-base sm:text-lg font-medium group-hover:text-accent transition-colors duration-300 line-clamp-1">
                                                {prevProject.title}
                                            </div>
                                        </div>
                                    </button>
                                ) : <div />}
                                {nextProject ? (
                                    <button
                                        onClick={() => push(`/project/${nextProject.id}`)}
                                        className="group flex items-center justify-end gap-3 py-4 pl-4 text-right"
                                    >
                                        <div className="min-w-0">
                                            <div className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-1">Next</div>
                                            <div className="text-base sm:text-lg font-medium group-hover:text-accent transition-colors duration-300 line-clamp-1">
                                                {nextProject.title}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 shrink-0 text-muted-foreground group-hover:translate-x-1 group-hover:text-foreground transition-all duration-300" />
                                    </button>
                                ) : <div />}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Scroll to top */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-8 right-8 z-50 w-10 h-10 rounded-full border border-border bg-background/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-all duration-300 ${
                    showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                }`}
            >
                <ArrowUp className="w-4 h-4" />
            </button>
        </>
    )
}

const GithubIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.38.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.1-.75.08-.74.08-.74 1.22.09 1.86 1.25 1.86 1.25 1.08 1.85 2.83 1.32 3.52 1.01.11-.78.42-1.32.76-1.63-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.53.12-3.19 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.89.12 3.19.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.47 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.88-.01 3.27 0 .32.21.7.82.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
)
