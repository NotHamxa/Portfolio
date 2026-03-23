"use client"

import { RefObject, useEffect, useState } from "react"
import Image from "next/image"
import { ProjectType } from "@/models/projectContent"
import { usePageTransition } from "@/components/page-transition"

interface Props {
    sectionsRef: RefObject<(HTMLElement | null)[]>
}

function ProjectSkeleton() {
    return (
        <div className="flex items-start gap-5 sm:gap-8 py-7 sm:py-9 animate-pulse">
            <div className="w-5 h-4 bg-muted rounded shrink-0 mt-1" />
            <div className="shrink-0 w-11 h-11 rounded-lg bg-muted" />
            <div className="flex-1 space-y-3">
                <div className="flex justify-between">
                    <div className="h-5 w-36 bg-muted rounded" />
                    <div className="h-3 w-16 bg-muted rounded" />
                </div>
                <div className="h-4 w-full max-w-md bg-muted rounded" />
            </div>
        </div>
    )
}

export default function ProjectsSection({ sectionsRef }: Props) {
    const { push } = usePageTransition()
    const [projects, setProjects] = useState<ProjectType[]>([])
    const [loading, setLoading] = useState(true)

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
            <div className="space-y-0">
                {/* Section header */}
                <div className="flex items-baseline justify-between pb-6 border-b border-border">
                    <h2 className="text-3xl sm:text-4xl font-medium">Projects</h2>
                    <span className="text-xs font-mono text-muted-foreground tracking-widest">
                        {String(projects.length).padStart(2, '0')} WORKS
                    </span>
                </div>

                {/* Loading skeleton */}
                {loading && (
                    <div className="divide-y divide-border">
                        {[0, 1, 2].map((i) => (
                            <ProjectSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* Project list */}
                {!loading && (
                    <div className="divide-y divide-border">
                        {projects.map((project, index) => (
                            <div
                                key={project.id}
                                onClick={() => push(`/project/${project.id}`)}
                                className="stagger-child group flex items-start gap-5 sm:gap-8 py-7 sm:py-9 transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:bg-muted/30 rounded-lg px-2 -mx-2"
                                style={{ animationDelay: `${index * 80}ms` }}
                            >
                                {/* Index */}
                                <span className="text-xs font-mono text-muted-foreground/50 pt-1 w-5 shrink-0 select-none tabular-nums">
                                    {String(index + 1).padStart(2, '0')}
                                </span>

                                {/* Logo / Initial */}
                                <div className="shrink-0 w-11 h-11 rounded-lg border border-border bg-muted/20 flex items-center justify-center overflow-hidden group-hover:border-accent/50 transition-colors duration-300">
                                    {project.logo ? (
                                        <Image
                                            src={project.logo}
                                            alt={`${project.title} logo`}
                                            width={44}
                                            height={44}
                                            className="w-full h-full object-contain p-2"
                                        />
                                    ) : (
                                        <span className="text-base font-medium text-muted-foreground select-none">
                                            {project.title[0]}
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 space-y-1.5">
                                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                                        <h3 className="text-base sm:text-lg font-medium leading-snug group-hover:text-accent transition-colors duration-300">
                                            {project.title}
                                        </h3>
                                        <span className="text-xs font-mono text-muted-foreground/60 shrink-0">
                                            {project.date}
                                        </span>
                                    </div>
                                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-2">
                                        {project.excerpt}
                                    </p>
                                </div>

                                {/* Arrow — hidden until hover */}
                                <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300 text-accent">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
