"use client"


import {RefObject} from "react";
import Link from "next/link";

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
    return (
        <section id="connect" ref={(el) => {
            sectionsRef.current[3] = el
        }} className="py-32 lg:py-40 opacity-0">
            <div className="grid lg:grid-cols-2 gap-12 sm:gap-16">
                <div className="space-y-6 sm:space-y-8">
                    <h2 className="text-3xl sm:text-4xl font-medium">Let&apos;s Connect</h2>

                    <div className="space-y-6">
                        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                            Always interested in new opportunities and collaborations.
                        </p>

                        <div className="space-y-4">
                            <Link
                                href={`mailto:${email}`}
                                className="group flex items-center gap-3 text-foreground hover:text-accent transition-colors duration-300"
                            >
                                <span className="text-base sm:text-lg">{email}</span>
                                <svg
                                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 sm:space-y-8">
                    <div className="text-sm text-muted-foreground font-mono">ELSEWHERE</div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {socials.map((social) => (
                            <Link
                                key={social.name}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group p-4 border border-border rounded-lg hover:border-accent/50 transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5"
                            >
                                <div className="space-y-2">
                                    <div className="text-foreground group-hover:text-accent transition-colors duration-300">
                                        {social.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">{social.handle}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>

    )
}
