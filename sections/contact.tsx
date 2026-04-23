"use client"


import {RefObject} from "react";
import Link from "next/link";
import { Mail, Github, Linkedin, ArrowUpRight } from "lucide-react";

interface Props {
    sectionsRef:RefObject<(HTMLElement | null)[]>
}

type socialsType = {
    name:string,
    handle:string,
    url:string,
}

export default function ContactSection({sectionsRef}: Props){
    const email = "hamxa.ahmed2007@gmail.com";
    const socials: socialsType[] = [
        { name: "GitHub", handle: "@NotHamxa", url: "https://github.com/NotHamxa" },
        { name: "LinkedIn", handle: "Hamza Ahmed", url: "https://linkedin.com/in/hamzahmed07" },
    ]
    const rows = [
        { key: "Email", value: email, href: `mailto:${email}`, icon: Mail, external: false },
        { key: "GitHub", value: socials[0].handle, href: socials[0].url, icon: Github, external: true },
        { key: "LinkedIn", value: socials[1].handle, href: socials[1].url, icon: Linkedin, external: true },
    ]

    return (
        <section id="connect" ref={(el) => {
            sectionsRef.current[3] = el
        }} className="py-32 lg:py-40 opacity-0">
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-start">
                <div>
                    <div className="text-[10.5px] font-mono text-muted-foreground tracking-[0.22em] uppercase mb-3">№ 04</div>
                    <h2 className="text-5xl sm:text-6xl font-light leading-none tracking-[-0.03em]">
                        Let&apos;s <span className="font-serif italic text-muted-foreground">connect.</span>
                    </h2>
                </div>

                <div className="pt-3">
                    {rows.map((r, i) => {
                        const Icon = r.icon
                        return (
                            <Link
                                key={r.key}
                                href={r.href}
                                {...(r.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                className={`group grid grid-cols-[20px_88px_1fr_auto] gap-4 py-4 items-center border-b border-border ${
                                    i === 0 ? "border-t" : ""
                                }`}
                            >
                                <Icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
                                <div className="font-mono text-[10.5px] tracking-[0.18em] text-muted-foreground uppercase">
                                    {r.key}
                                </div>
                                <div className="text-[15px] tracking-[-0.005em] group-hover:text-accent transition-colors duration-300 truncate">
                                    {r.value}
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" strokeWidth={1.5} />
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>

    )
}
