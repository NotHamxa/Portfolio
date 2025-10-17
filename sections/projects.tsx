import { RefObject } from "react";
import Link from "next/link";

interface Props {
    sectionsRef: RefObject<(HTMLElement | null)[]>;
}

type Project = {
    title: string;
    excerpt: string;
    date: string;
    readTime: string;
};

export default function ProjectsSection({ sectionsRef }: Props) {
    const projects: Project[] = [
        {
            title: "Volt",
            excerpt: "",
            date: "May 2025",
            readTime: "",
        },
        {
            title: "Epsilon",
            excerpt:
                "The entire tech stack built for the team registrations of epsilon (Alpha College Science Olympiad)",
            date: "Oct 2024 - Feb 2025",
            readTime: "",
        },
    ];

    return (
        <section
            id="thoughts"
            ref={(el) => {
                sectionsRef.current[2] = el;
            }}
            className="min-h-screen py-20 sm:py-32 opacity-0"
        >
            <div className="space-y-12 sm:space-y-16">
                <h2 className="text-3xl sm:text-4xl font-light">Projects</h2>

                <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
                    {projects.map((post, index) => (
                        <Link
                            key={index}
                            href={`/project/${post.title.toLowerCase()}`}
                            className="group p-6 sm:p-8 border border-border rounded-lg hover:border-muted-foreground/50 transition-all duration-500 hover:shadow-lg cursor-pointer block"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                                    <span>{post.date}</span>
                                    <span>{post.readTime}</span>
                                </div>

                                <h3 className="text-lg sm:text-xl font-medium group-hover:text-muted-foreground transition-colors duration-300">
                                    {post.title}
                                </h3>

                                <p className="text-muted-foreground leading-relaxed">
                                    {post.excerpt}
                                </p>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                                    <span>Read more</span>
                                    <svg
                                        className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
