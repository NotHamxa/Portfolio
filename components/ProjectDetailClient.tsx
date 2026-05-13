"use client"

import Image from "next/image"
import { ExternalLink, ArrowUp, X, ArrowLeft, Download, Share2, Check } from "lucide-react"
import { usePageTransition } from "@/components/page-transition"
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

interface Props {
    data: ProjectType
    allProjects: ProjectType[]
}

export default function ProjectDetailClient({ data, allProjects }: Props) {
    const { push } = usePageTransition()

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
            { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
        )
        sectionsRef.current.forEach((section) => {
            if (section) observer.observe(section)
        })
        return () => observer.disconnect()
    }, [data])

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY
            setShowScrollTop(scrollTop > 400)

            if (titleRef.current) {
                const rect = titleRef.current.getBoundingClientRect()
                setShowStickyHeader(rect.bottom < 100)
            }

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

    const currentIndex = allProjects.findIndex(p => p.id === data.id)
    const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null
    const nextProject = currentIndex >= 0 && currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null

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

            <div className={`fixed left-0 right-0 top-0 z-50 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${showStickyHeader ? "translate-y-0" : "-translate-y-full"}`}>
                <div className="bg-background/75 backdrop-blur-xl">
                    <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between h-14 font-mono text-[10.5px] tracking-[0.22em] uppercase">
                        <div className="flex items-center gap-3 text-muted-foreground min-w-0">
                            <button
                                onClick={() => push("/")}
                                className="flex items-center gap-1.5 text-foreground hover:text-accent transition-colors shrink-0"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
                                Home
                            </button>
                            <span className="text-muted-foreground/50">/</span>
                            <button
                                onClick={() => push("/#thoughts")}
                                className="hover:text-foreground transition-colors shrink-0"
                            >
                                Projects
                            </button>
                            <span className="text-muted-foreground/50">/</span>
                            <span className="text-foreground truncate normal-case tracking-normal text-[12px]">
                                {title}
                            </span>
                        </div>
                        <div className="hidden sm:flex items-center gap-5 shrink-0">
                            {downloadUrl && (
                                <button
                                    onClick={() => setDownloadModalOpen(true)}
                                    aria-label="Download"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Download className="w-4 h-4" strokeWidth={1.5} />
                                </button>
                            )}
                            {githubUrl && githubUrl.length > 0 && (
                                <button
                                    onClick={handleGithubClick}
                                    aria-label="GitHub"
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <GithubIcon className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={copyLink}
                                aria-label={copied ? "Copied" : "Share"}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {copied ? <Check className="w-4 h-4" strokeWidth={1.5} /> : <Share2 className="w-4 h-4" strokeWidth={1.5} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {headings.length > 1 && (
                <nav className="group/toc fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-3 items-end">
                    {headings.map((h, i) => (
                        <button
                            key={i}
                            onClick={() => headingRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" })}
                            className="group/tick flex items-center gap-3 cursor-pointer"
                            aria-label={h.content}
                        >
                            <span
                                className={`font-mono text-[10.5px] tracking-[0.08em] max-w-[180px] truncate opacity-0 -translate-x-1 transition-all duration-300 group-hover/toc:opacity-100 group-hover/toc:translate-x-0 ${
                                    activeHeading === i
                                        ? "text-foreground !opacity-100 !translate-x-0"
                                        : "text-muted-foreground group-hover/tick:text-foreground"
                                }`}
                            >
                                {h.content}
                            </span>
                            <span
                                className={`h-px transition-all duration-300 ${
                                    activeHeading === i
                                        ? "w-8 bg-foreground"
                                        : "w-4 bg-muted-foreground/40 group-hover/tick:w-6 group-hover/tick:bg-foreground"
                                }`}
                            />
                        </button>
                    ))}
                </nav>
            )}

            <div className="min-h-screen bg-background">
                <div className="border-b border-border">
                    <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 sm:pt-28 pb-14">
                        <div ref={titleRef}>
                            <div className="flex items-center gap-3 font-mono text-[10.5px] tracking-[0.22em] uppercase text-muted-foreground mb-10">
                                <button
                                    onClick={() => push("/")}
                                    className="flex items-center gap-1.5 text-foreground hover:text-accent transition-colors"
                                >
                                    <ArrowLeft className="w-3 h-3" strokeWidth={2} />
                                    Home
                                </button>
                                <span className="text-muted-foreground/50">/</span>
                                <button
                                    onClick={() => push("/#thoughts")}
                                    className="hover:text-foreground transition-colors"
                                >
                                    Projects
                                </button>
                                <span className="text-muted-foreground/50">/</span>
                                <span className="text-foreground truncate normal-case tracking-normal text-[12px] font-sans">
                                    {title}
                                </span>
                                {date && <span className="text-muted-foreground/60">· {date}</span>}
                            </div>

                            <div className="flex items-start gap-5 sm:gap-7">
                                {logo && (
                                    <Image
                                        src={logo}
                                        alt={`${title} logo`}
                                        width={72}
                                        height={72}
                                        className="w-14 h-14 sm:w-16 sm:h-16 lg:w-[72px] lg:h-[72px] object-contain shrink-0 mt-2 sm:mt-3"
                                    />
                                )}
                                <h1 className="font-serif text-5xl sm:text-7xl lg:text-[96px] font-normal tracking-[-0.03em] leading-[0.96] max-w-[14ch]">
                                    {title}
                                </h1>
                            </div>

                            <div className="flex flex-wrap items-end gap-x-12 gap-y-6 mt-14 pt-7 border-t border-border">
                                {date && (
                                    <div>
                                        <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-muted-foreground mb-2">Year</div>
                                        <div className="text-[17px] tracking-[-0.01em]">{date}</div>
                                    </div>
                                )}
                                <div>
                                    <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-muted-foreground mb-2">Index</div>
                                    <div className="text-[17px] tracking-[-0.01em]">
                                        № {String(currentIndex + 1).padStart(2, "0")}
                                        {allProjects.length > 0 && (
                                            <span className="text-muted-foreground"> of {String(allProjects.length).padStart(2, "0")}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="w-full sm:w-auto sm:ml-auto flex items-end gap-5 font-mono text-[11px] tracking-[0.1em]">
                                    {downloadUrl && (
                                        <button
                                            onClick={() => setDownloadModalOpen(true)}
                                            className="group flex items-center gap-1.5 text-foreground border-b border-foreground pb-1 hover:text-accent hover:border-accent transition-colors"
                                        >
                                            <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
                                            Download
                                        </button>
                                    )}
                                    {githubUrl && githubUrl.length > 0 && (
                                        <button
                                            onClick={handleGithubClick}
                                            className="flex items-center gap-1.5 text-muted-foreground pb-1 hover:text-foreground transition-colors"
                                        >
                                            <GithubIcon className="w-3.5 h-3.5" />
                                            GitHub
                                        </button>
                                    )}
                                    <button
                                        onClick={copyLink}
                                        className="flex items-center gap-1.5 text-muted-foreground pb-1 hover:text-foreground transition-colors"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5" strokeWidth={1.75} /> : <Share2 className="w-3.5 h-3.5" strokeWidth={1.75} />}
                                        {copied ? "Copied" : "Share"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <article className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-24">
                    {blocks.map((block, idx) => {
                        const delay = idx * 60
                        const reveal = "opacity-0 translate-y-8 transition-all duration-700"

                        if (block.type === "text") {
                            return (
                                <div key={idx} ref={(el) => { sectionsRef.current[idx] = el }}
                                    className={`${reveal} max-w-[68ch] mb-10 sm:mb-12`}
                                    style={{ transitionDelay: `${delay}ms` }}>
                                    <p className="text-base sm:text-[17px] leading-[1.85] text-muted-foreground">
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
                                    className={`${reveal} max-w-[68ch] pt-10 sm:pt-14 mb-8 sm:mb-10 first:pt-0`}
                                    style={{ transitionDelay: `${delay}ms` }}>
                                    <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-muted-foreground mb-4 tabular-nums">
                                        № {String(hIdx + 1).padStart(2, "0")}
                                    </div>
                                    <h2 className="font-serif font-normal text-3xl sm:text-[38px] tracking-[-0.015em] leading-[1.1] max-w-[22ch]">
                                        {block.content}
                                    </h2>
                                </div>
                            )
                        }

                        if (block.type === "img") {
                            return (
                                <div key={idx} ref={(el) => { sectionsRef.current[idx] = el }}
                                    className={`${reveal} my-14 sm:my-16`}
                                    style={{ transitionDelay: `${delay}ms` }}>
                                    <div
                                        className="group w-full overflow-hidden bg-muted/40 cursor-zoom-in"
                                        onClick={() => setLightboxSrc(block.content)}
                                    >
                                        <Image
                                            src={block.content}
                                            alt=""
                                            width={1920}
                                            height={1080}
                                            className="w-full h-auto object-contain transition-transform duration-[900ms] ease-out group-hover:scale-[1.01]"
                                            style={{ maxHeight: '75vh' }}
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
                                    className={`${reveal} my-14 sm:my-16`}
                                    style={{ transitionDelay: `${delay}ms` }}>
                                    <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${isImageLeft ? "" : "lg:grid-flow-dense"}`}>
                                        <div
                                            className={`w-full overflow-hidden bg-muted/40 cursor-zoom-in ${isImageLeft ? "" : "lg:col-start-2"}`}
                                            onClick={() => setLightboxSrc(block.imgSrc || "")}
                                        >
                                            <Image
                                                src={block.imgSrc || ""}
                                                alt=""
                                                width={800}
                                                height={600}
                                                className="w-full h-auto object-contain"
                                                style={{ maxHeight: '520px' }}
                                                placeholder="empty"
                                            />
                                        </div>
                                        <div className={isImageLeft ? "" : "lg:col-start-1 lg:row-start-1"}>
                                            <p className="text-base sm:text-[17px] leading-[1.85] text-muted-foreground max-w-[52ch]">
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
                                    className={`${reveal} max-w-[68ch] my-10`}
                                    style={{ transitionDelay: `${delay}ms` }}>
                                    <a
                                        href={block.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group inline-flex items-baseline gap-2 font-mono text-[11px] tracking-[0.1em] text-foreground border-b border-foreground pb-1 hover:text-accent hover:border-accent transition-colors"
                                    >
                                        {block.content}
                                        <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                                    </a>
                                </div>
                            )
                        }

                        return null
                    })}
                </article>

                {(prevProject || nextProject) && (
                    <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 pt-10 pb-20 sm:pb-24">
                        <div className="grid grid-cols-[1fr_auto_1fr] gap-6 sm:gap-10 pt-10 border-t border-border items-start">
                            {prevProject ? (
                                <button
                                    onClick={() => push(`/project/${prevProject.id}`)}
                                    className="group text-left"
                                >
                                    <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-muted-foreground mb-3 group-hover:-translate-x-0.5 transition-transform duration-300">
                                        ← Previous
                                    </div>
                                    <div className="font-serif text-xl sm:text-2xl font-normal tracking-[-0.01em] group-hover:text-accent transition-colors duration-300">
                                        {prevProject.title}
                                    </div>
                                    {prevProject.date && (
                                        <div className="font-mono text-[10.5px] text-muted-foreground tracking-[0.1em] mt-1.5">
                                            {prevProject.date}
                                        </div>
                                    )}
                                </button>
                            ) : <div />}

                            <div className="hidden sm:flex flex-col items-center gap-1.5 pt-1 font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground/70 self-center">
                                <div className="flex items-center gap-1.5">
                                    <kbd className="inline-flex items-center justify-center w-6 h-6 border border-border rounded text-[11px] leading-none">←</kbd>
                                    <kbd className="inline-flex items-center justify-center w-6 h-6 border border-border rounded text-[11px] leading-none">→</kbd>
                                </div>
                                <span>to navigate</span>
                            </div>

                            {nextProject ? (
                                <button
                                    onClick={() => push(`/project/${nextProject.id}`)}
                                    className="group text-right"
                                >
                                    <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-muted-foreground mb-3 group-hover:translate-x-0.5 transition-transform duration-300">
                                        Next →
                                    </div>
                                    <div className="font-serif text-xl sm:text-2xl font-normal tracking-[-0.01em] group-hover:text-accent transition-colors duration-300">
                                        {nextProject.title}
                                    </div>
                                    {nextProject.date && (
                                        <div className="font-mono text-[10.5px] text-muted-foreground tracking-[0.1em] mt-1.5">
                                            {nextProject.date}
                                        </div>
                                    )}
                                </button>
                            ) : <div />}
                        </div>
                    </div>
                )}
            </div>

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
