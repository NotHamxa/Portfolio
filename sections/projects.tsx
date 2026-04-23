"use client"

import { RefObject, useEffect, useState } from "react"
import Image from "next/image"
import { ProjectType } from "@/models/projectContent"
import { usePageTransition } from "@/components/page-transition"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowUpRight } from "lucide-react"

interface Props {
    sectionsRef: RefObject<(HTMLElement | null)[]>
}

const VISIBLE_COUNT = 7 // featured + 6 grid cards

function extractFirstImage(content: string): string | null {
    const match = content?.match(/<img>(.*?)<\/img>|<imgText[^>]*src="(.*?)"/)
    const url = match?.[1] || match?.[2]
    return url?.trim() || null
}

function FeaturedProject({ project, onClick }: { project: ProjectType; onClick: () => void }) {
    const previewImage = extractFirstImage(project.content || "")

    return (
        <div
            onClick={onClick}
            className="stagger-child group grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-10 md:gap-12 py-10 md:py-14 border-b border-border cursor-pointer"
        >
            <div>
                <div className="text-[10.5px] font-mono text-muted-foreground tracking-[0.22em] uppercase mb-4">
                    Featured &nbsp;·&nbsp; № 01 &nbsp;·&nbsp; {project.date}
                </div>
                <div className="flex items-center gap-4">
                    {project.logo && (
                        <Image
                            src={project.logo}
                            alt={`${project.title} logo`}
                            width={40}
                            height={40}
                            className="w-10 h-10 object-contain shrink-0 opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                    )}
                    <h3 className="font-serif text-3xl sm:text-[42px] font-normal tracking-[-0.015em] leading-[1.05] group-hover:text-accent transition-colors duration-300">
                        {project.title}
                    </h3>
                </div>
                <p className="text-sm sm:text-[15.5px] text-muted-foreground leading-[1.75] mt-5 max-w-[44ch]">
                    {project.excerpt}
                </p>
                <div className="flex items-center gap-2 mt-8 font-mono text-[11px] tracking-[0.1em] text-foreground">
                    <span className="group-hover:translate-x-0.5 transition-transform duration-300">
                        Read case study
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" strokeWidth={1.75} />
                </div>
            </div>

            <FeaturedPreview project={project} previewImage={previewImage} />
        </div>
    )
}

function FeaturedPreview({
    project,
    previewImage,
}: {
    project: ProjectType
    previewImage: string | null
}) {
    // Real screenshot if available
    if (previewImage) {
        return (
            <div className="relative aspect-[4/3] overflow-hidden bg-muted/40">
                <Image
                    src={previewImage}
                    alt={`${project.title} preview`}
                    fill
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.02]"
                    sizes="(min-width: 768px) 50vw, 100vw"
                />
                {/* Subtle bottom gradient for caption legibility */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-mono text-[10px] tracking-[0.14em] uppercase text-white/85">
                    <span className="truncate">/project/{project.id}</span>
                    <span className="shrink-0">{project.date}</span>
                </div>
            </div>
        )
    }

    // Fallback — editorial poster from project data
    return (
        <div className="relative aspect-[4/3] bg-muted/40 overflow-hidden flex flex-col">
            {/* Top meta row */}
            <div className="flex items-center justify-between p-5 font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
                <span>Cover &nbsp;·&nbsp; {project.date}</span>
                <span className="text-foreground">№ 01</span>
            </div>

            {/* Centerpiece — logo + title */}
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 -mt-6">
                {project.logo ? (
                    <Image
                        src={project.logo}
                        alt=""
                        width={64}
                        height={64}
                        className="w-14 h-14 sm:w-16 sm:h-16 object-contain opacity-90 mb-6"
                    />
                ) : (
                    <span className="font-serif italic text-5xl text-muted-foreground mb-5">
                        {project.title[0]}
                    </span>
                )}
                <div className="font-serif text-[26px] sm:text-3xl font-normal tracking-[-0.01em] leading-[1.1] max-w-[20ch]">
                    {project.title}
                </div>
            </div>

            {/* Bottom caption rail */}
            <div className="flex items-center justify-between p-5 border-t border-border/60 font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                <span className="truncate">/project/{project.id}</span>
                <span className="shrink-0 text-muted-foreground/70">Case study →</span>
            </div>
        </div>
    )
}

function ProjectCard({
    project,
    index,
    onClick,
}: {
    project: ProjectType
    index: number
    onClick: () => void
}) {
    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col h-full border border-border p-6 sm:p-7 cursor-pointer bg-background hover:bg-muted/30 transition-colors duration-300"
        >
            {/* Top — index + year */}
            <div className="flex items-center justify-between mb-7">
                <span className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-muted-foreground/70 tabular-nums">
                    № {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground/70">
                    {project.date}
                </span>
            </div>

            {/* Logo + title */}
            <div className="flex items-center gap-3 mb-3">
                {project.logo ? (
                    <Image
                        src={project.logo}
                        alt={`${project.title} logo`}
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain shrink-0 opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                ) : (
                    <span className="w-8 h-8 shrink-0 flex items-center justify-center font-serif italic text-lg text-muted-foreground">
                        {project.title[0]}
                    </span>
                )}
                <h3 className="font-serif text-[22px] sm:text-2xl font-normal tracking-[-0.01em] leading-[1.1] group-hover:text-accent transition-colors duration-300">
                    {project.title}
                </h3>
            </div>

            {/* Excerpt */}
            <p className="text-sm text-muted-foreground leading-[1.7] line-clamp-3 mb-8">
                {project.excerpt}
            </p>

            {/* Bottom — arrow affordance */}
            <div className="mt-auto flex items-center justify-end gap-2 font-mono text-[11px] tracking-[0.1em] text-muted-foreground group-hover:text-foreground transition-colors">
                <span>Open</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" strokeWidth={1.75} />
            </div>
        </div>
    )
}

function ProjectSkeleton() {
    return (
        <div className="border border-border p-6 sm:p-7 animate-pulse">
            <div className="flex items-center justify-between mb-7">
                <div className="h-3 w-10 bg-muted rounded" />
                <div className="h-3 w-12 bg-muted rounded" />
            </div>
            <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-muted rounded" />
                <div className="h-6 w-40 bg-muted rounded" />
            </div>
            <div className="h-3 w-full bg-muted rounded mb-2" />
            <div className="h-3 w-5/6 bg-muted rounded" />
        </div>
    )
}

export default function ProjectsSection({ sectionsRef }: Props) {
    const { push } = usePageTransition()
    const [projects, setProjects] = useState<ProjectType[]>([])
    const [loading, setLoading] = useState(true)
    const [archiveOpen, setArchiveOpen] = useState(false)

    const openProject = (id: string) => {
        setArchiveOpen(false)
        push(`/project/${id}`)
    }

    useEffect(() => {
        fetch('/api/projects')
            .then(r => r.json())
            .then((data) => {
                setProjects(data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    return (
        <section
            id="thoughts"
            ref={(el) => { sectionsRef.current[2] = el }}
            className="py-32 lg:py-40 opacity-0"
        >
            <div>
                {/* Section header */}
                <div className="flex items-end justify-between mb-14">
                    <div>
                        <div className="text-[10.5px] font-mono text-muted-foreground tracking-[0.22em] uppercase mb-3">№ 03</div>
                        <h2 className="text-4xl sm:text-5xl font-light leading-none tracking-[-0.03em]">
                            Selected <span className="font-serif italic text-muted-foreground">projects</span>
                        </h2>
                    </div>
                    <div className="text-right font-mono text-[11px] tracking-[0.14em] text-muted-foreground leading-[1.8]">
                        {String(projects.length).padStart(2, "0")} works
                        <br />
                        <span className="text-muted-foreground/60">2023 — 2026</span>
                    </div>
                </div>

                {/* Loading skeleton */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[0, 1, 2, 3].map((i) => (
                            <ProjectSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* Project list */}
                {!loading && projects.length > 0 && (
                    <>
                        <FeaturedProject project={projects[0]} onClick={() => openProject(projects[0].id)} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
                            {projects.slice(1, VISIBLE_COUNT).map((project, idx) => (
                                <div
                                    key={project.id}
                                    className="stagger-child"
                                    style={{ animationDelay: `${(idx + 1) * 80}ms` }}
                                >
                                    <ProjectCard
                                        project={project}
                                        index={idx + 1}
                                        onClick={() => openProject(project.id)}
                                    />
                                </div>
                            ))}
                        </div>

                        {projects.length > VISIBLE_COUNT && (
                            <div className="flex items-center justify-between pt-10">
                                <span className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-muted-foreground">
                                    {projects.length - VISIBLE_COUNT} more in the archive
                                </span>
                                <button
                                    onClick={() => setArchiveOpen(true)}
                                    className="group font-mono text-[11px] tracking-[0.1em] text-foreground hover:text-accent transition-colors"
                                >
                                    View all ({String(projects.length).padStart(2, "0")}){" "}
                                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <ArchiveDialog
                open={archiveOpen}
                onOpenChange={setArchiveOpen}
                projects={projects}
                onSelect={openProject}
            />
        </section>
    )
}

function ArchiveDialog({
    open,
    onOpenChange,
    projects,
    onSelect,
}: {
    open: boolean
    onOpenChange: (v: boolean) => void
    projects: ProjectType[]
    onSelect: (id: string) => void
}) {
    const [query, setQuery] = useState("")

    useEffect(() => {
        if (!open) setQuery("")
    }, [open])

    const filtered = query.trim()
        ? projects.filter((p) =>
              (p.title + " " + p.excerpt + " " + p.date).toLowerCase().includes(query.toLowerCase())
          )
        : projects

    const grouped = filtered.reduce<Record<string, ProjectType[]>>((acc, p) => {
        const year = (p.date || "—").toString()
        acc[year] = acc[year] || []
        acc[year].push(p)
        return acc
    }, {})
    const years = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton
                className="!max-w-2xl p-0 gap-0 border-border bg-background overflow-hidden"
            >
                <DialogTitle className="sr-only">Project archive</DialogTitle>

                <div className="px-8 pt-8 pb-5 border-b border-border">
                    <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-muted-foreground mb-3">
                        Archive &nbsp;·&nbsp; {String(projects.length).padStart(2, "0")} works
                    </div>
                    <div className="flex items-end justify-between gap-6">
                        <h2 className="text-3xl sm:text-4xl font-light leading-none tracking-[-0.03em]">
                            Every <span className="font-serif italic text-muted-foreground">project.</span>
                        </h2>
                    </div>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by title, year, or keyword…"
                        className="mt-6 w-full bg-transparent border-0 border-b border-border pb-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors"
                    />
                </div>

                <ScrollArea className="max-h-[60vh]">
                    <div className="px-8 pb-8">
                        {years.length === 0 && (
                            <div className="py-16 text-center font-mono text-[11px] tracking-[0.1em] text-muted-foreground">
                                No matches.
                            </div>
                        )}
                        {years.map((year) => (
                            <div key={year} className="pt-6">
                                <div className="grid grid-cols-[80px_1fr] gap-6 items-start py-3 border-b border-border">
                                    <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-muted-foreground pt-1">
                                        {year}
                                    </div>
                                    <div>
                                        {grouped[year].map((p, idx) => {
                                            const globalIdx = projects.findIndex((x) => x.id === p.id)
                                            return (
                                                <button
                                                    key={p.id}
                                                    onClick={() => onSelect(p.id)}
                                                    className={`group w-full grid grid-cols-[28px_1fr_20px] gap-4 items-baseline py-3 text-left ${
                                                        idx > 0 ? "border-t border-border/60" : ""
                                                    }`}
                                                >
                                                    <span className="font-mono text-[11px] text-muted-foreground/60 tabular-nums">
                                                        {String(globalIdx + 1).padStart(2, "0")}
                                                    </span>
                                                    <span className="text-[15px] font-medium tracking-[-0.005em] group-hover:text-accent transition-colors truncate">
                                                        {p.title}
                                                    </span>
                                                    <span className="font-mono text-[11px] text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all text-right">
                                                        →
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
