"use client"

import { ArrowLeft } from "lucide-react"
import { usePageTransition } from "@/components/page-transition"

export default function NotFound() {
    const { push } = usePageTransition()

    return (
        <div className="min-h-screen flex items-center justify-center px-6 sm:px-8 lg:px-16">
            <div className="max-w-4xl w-full">
                <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-muted-foreground mb-6">
                    Error &nbsp;/&nbsp; 404
                </div>

                <h1 className="text-6xl sm:text-7xl lg:text-[104px] font-light leading-[0.94] tracking-[-0.04em]">
                    Page not
                    <br />
                    <span className="font-serif italic font-normal text-muted-foreground">found.</span>
                </h1>

                <p className="text-base sm:text-lg text-muted-foreground leading-[1.65] mt-8 max-w-[38ch]">
                    The thing you were looking for isn&apos;t here. Might&apos;ve moved, might&apos;ve never existed.
                </p>

                <button
                    onClick={() => push("/")}
                    className="group mt-10 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] text-foreground border-b border-foreground pb-1 hover:text-accent hover:border-accent transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-300" strokeWidth={1.75} />
                    Back home
                </button>
            </div>
        </div>
    )
}
