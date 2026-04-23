"use client"

import {RefObject, useEffect, useState} from "react";

const TAGLINE = "Lowkey writing code all day."

interface Props {
    sectionsRef:RefObject<(HTMLElement | null)[]>
}
export default function Header({sectionsRef}:Props){
    const skills:string[] = ["Python","FastAPI","React","Next.js","TypeScript","C++",".NET","MongoDB","MySQL"]

    const [typed, setTyped] = useState(() => {
        if (typeof window === "undefined") return ""
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? TAGLINE : ""
    })

    useEffect(() => {
        if (typed === TAGLINE) return
        let i = typed.length
        const id = setInterval(() => {
            i++
            setTyped(TAGLINE.slice(0, i))
            if (i >= TAGLINE.length) clearInterval(id)
        }, 35)
        return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <header
            id="intro"
            ref={(el) => {
                sectionsRef.current[0] = el
            }}
            className="min-h-screen flex items-center opacity-0"
        >
            <div className="w-full">
                <div className="text-[10.5px] font-mono text-muted-foreground tracking-[0.22em] uppercase mb-10">
                    Portfolio &nbsp;/&nbsp; 2026 &nbsp;·&nbsp; Vol. I
                </div>

                <div className="grid lg:grid-cols-[1.5fr_1fr] gap-12 lg:gap-20 items-start">
                    <div>
                        <h1 className="text-5xl sm:text-6xl lg:text-[104px] font-light leading-[0.94] tracking-[-0.04em]">
                            Hamza
                            <br />
                            <span className="font-serif italic font-normal text-muted-foreground">Ahmed.</span>
                        </h1>

                        <p className="text-lg sm:text-xl text-muted-foreground leading-[1.65] max-w-[34ch] mt-8 sm:mt-10 min-h-[1.65em]">
                            <span aria-label={TAGLINE}>{typed}</span>
                            <span className="blink-cursor text-foreground" aria-hidden="true" />
                        </p>
                    </div>

                    <div className="flex flex-col gap-7 lg:pt-5">
                        <div>
                            <div className="text-[10.5px] font-mono text-foreground tracking-[0.22em] uppercase mb-2">Status</div>
                            <div className="text-sm text-muted-foreground leading-[1.6] max-w-[28ch]">
                                Open to work.
                            </div>
                        </div>
                        <div>
                            <div className="text-[10.5px] font-mono text-foreground tracking-[0.22em] uppercase mb-2">Based</div>
                            <div className="text-sm text-muted-foreground">Islamabad, Pakistan — UTC+5</div>
                        </div>
                        <div>
                            <div className="text-[10.5px] font-mono text-foreground tracking-[0.22em] uppercase mb-2">At</div>
                            <div className="text-sm text-muted-foreground">NUST · SEECS · since 2025</div>
                        </div>
                    </div>
                </div>

                {/* Skill row — hairline, comma/dot separated */}
                <div className="mt-20 sm:mt-24 pt-5 border-t border-border flex flex-wrap items-baseline gap-x-6 gap-y-2 font-mono text-[11.5px] tracking-[0.08em] text-muted-foreground">
                    <span className="text-foreground">Stack</span>
                    <span>{skills.join("  ·  ")}</span>
                </div>
            </div>
        </header>
    )
}
