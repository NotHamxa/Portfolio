"use client"

import { RefObject, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ProjectType } from "@/models/projectContent"

interface Props {
    sectionsRef: RefObject<(HTMLElement | null)[]>
}

export default function ProjectsSection({ sectionsRef }: Props) {
    const [projects, setProjects] = useState<ProjectType[]>([])

    useEffect(() => {
        fetch('/api/projects')
            .then(r => r.json())
            .then(setProjects)
            .catch(() => {})
    }, [])

    return (
        <section
            id="thoughts"
            ref={(el) => { sectionsRef.current[2] = el }}
            className="min-h-screen py-20 sm:py-32 opacity-0"
        >
            <div className="space-y-0">
                {/* Section header */}
                <div className="flex items-baseline justify-between pb-6 border-b border-border">
                    <h2 className="text-3xl sm:text-4xl font-medium">Projects</h2>
                    <span className="text-xs font-mono text-muted-foreground tracking-widest">
                        {String(projects.length).padStart(2, '0')} WORKS
                    </span>
                </div>

                {/* Project list */}
                <div className="divide-y divide-border">
                    {projects.map((project, index) => (
                        <Link
                            key={project.id}
                            href={`/project/${project.id}`}
                            className="group flex items-start gap-5 sm:gap-8 py-7 sm:py-9 transition-all duration-300 cursor-pointer"
                        >
                            {/* Index */}
                            <span className="text-xs font-mono text-muted-foreground/50 pt-1 w-5 shrink-0 select-none tabular-nums">
                                {String(index + 1).padStart(2, '0')}
                            </span>

                            {/* Logo / Initial */}
                            <div className="shrink-0 w-11 h-11 rounded-lg border border-border bg-muted/20 flex items-center justify-center overflow-hidden group-hover:border-muted-foreground/50 transition-colors duration-300">
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
                                    <h3 className="text-base sm:text-lg font-medium leading-snug group-hover:text-muted-foreground transition-colors duration-300">
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
                            <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300 text-foreground">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
