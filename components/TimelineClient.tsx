"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowUp, Share2, Check } from "lucide-react"
import { usePageTransition } from "@/components/page-transition"
import { TimelineType } from "@/models/timelineContent"

interface Props {
    data: TimelineType
}

export default function TimelineClient({ data }: Props) {
    const { push } = usePageTransition()
    const { title, entries } = data

    const rowsRef = useRef<(HTMLElement | null)[]>([])
    const titleRef = useRef<HTMLDivElement | null>(null)
    const [showStickyHeader, setShowStickyHeader] = useState(false)
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (obsEntries) => {
                obsEntries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("animate-fade-in-up")
                        observer.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
        )
        rowsRef.current.forEach((row) => {
            if (row) observer.observe(row)
        })
        return () => observer.disconnect()
    }, [data])

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400)
            if (titleRef.current) {
                const rect = titleRef.current.getBoundingClientRect()
                setShowStickyHeader(rect.bottom < 100)
            }
        }
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const copyLink = async () => {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })

    return (
        <>
            {/* Sticky header */}
            <div className={`fixed left-0 right-0 top-0 z-50 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${showStickyHeader ? "translate-y-0" : "-translate-y-full"}`}>
                <div className="bg-background/75 backdrop-blur-xl">
                    <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between h-14 font-mono text-[10.5px] tracking-[0.22em] uppercase">
                        <div className="flex items-center gap-3 text-muted-foreground min-w-0">
                            <button
                                onClick={() => push("/")}
                                className="flex items-center gap-1.5 text-foreground hover:text-accent transition-colors shrink-0"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
                                Home
                            </button>
                            <span className="text-muted-foreground/50">/</span>
                            <span className="shrink-0">Timeline</span>
                            <span className="text-muted-foreground/50">/</span>
                            <span className="text-foreground truncate normal-case tracking-normal text-[12px]">
                                {title}
                            </span>
                        </div>
                        <button
                            onClick={copyLink}
                            aria-label={copied ? "Copied" : "Share"}
                            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        >
                            {copied ? <Check className="w-4 h-4" strokeWidth={1.5} /> : <Share2 className="w-4 h-4" strokeWidth={1.5} />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="min-h-screen bg-background">
                {/* Title block */}
                <div className="border-b border-border">
                    <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 sm:pt-28 pb-14">
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
                                <span>Timeline</span>
                            </div>

                            <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-muted-foreground mb-4">
                                Progress Log
                            </div>
                            <h1 className="font-serif text-5xl sm:text-7xl lg:text-[88px] font-normal tracking-[-0.03em] leading-[0.96] max-w-[16ch]">
                                {title}
                            </h1>

                            <div className="flex flex-wrap items-end gap-x-12 gap-y-6 mt-14 pt-7 border-t border-border">
                                <div>
                                    <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-muted-foreground mb-2">Entries</div>
                                    <div className="text-[17px] tracking-[-0.01em] tabular-nums">
                                        {String(entries?.length ?? 0).padStart(2, "0")}
                                    </div>
                                </div>
                                <div className="w-full sm:w-auto sm:ml-auto flex items-end gap-5 font-mono text-[11px] tracking-[0.1em]">
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

                {/* Timeline entries */}
                <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-16 lg:py-24">
                    {(!entries || entries.length === 0) ? (
                        <p className="font-mono text-sm text-muted-foreground">No entries yet.</p>
                    ) : (
                        <div className="relative">
                            {/* vertical spine */}
                            <div className="absolute left-0 sm:left-[140px] top-2 bottom-2 w-px bg-border" aria-hidden />
                            <div className="space-y-0">
                                {entries.map((entry, idx) => (
                                    <article
                                        key={idx}
                                        ref={(el) => { rowsRef.current[idx] = el }}
                                        className="group relative opacity-0 translate-y-8 transition-all duration-700 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-8 gap-y-2 py-7 border-b border-border/70"
                                        style={{ transitionDelay: `${idx * 60}ms` }}
                                    >
                                        {/* date + node */}
                                        <div className="relative sm:text-right sm:pr-8">
                                            <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
                                                {entry.date}
                                            </span>
                                            {/* node dot on the spine */}
                                            <span
                                                className="hidden sm:block absolute top-1.5 -right-[5px] w-[9px] h-[9px] rounded-full border-2 border-background bg-muted-foreground/50 group-hover:bg-accent transition-colors"
                                                aria-hidden
                                            />
                                        </div>
                                        {/* note */}
                                        <div className="sm:pl-8">
                                            <p className="text-base sm:text-[17px] leading-[1.8] text-foreground/90 whitespace-pre-wrap">
                                                {entry.note}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
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
