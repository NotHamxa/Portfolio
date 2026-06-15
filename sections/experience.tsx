import {RefObject} from "react";

interface Props {
    sectionsRef:RefObject<(HTMLElement | null)[]>
}

type experience = {
    year:string,
    role:string,
    company:string,
    description:string,
    tech:string[]
}

export default function ExperienceSection({sectionsRef}: Props) {
    const experiences:experience[] = [
        {
            year: "2026",
            role: "Intern",
            company: "MacCare",
            description: "",
            tech: [],
        },
        {
            year: "2024",
            role: "Junior Software Trainee",
            company: "Foxit",
            description: "Developed and maintained ASP .NET projects — first exposure to real release cycles.",
            tech: ["ASP .NET", "C#", "MySQL"],
        },
        {
            year: "2023",
            role: "Intern",
            company: "DOST",
            description: "REST APIs, NoSQL, auth & security fundamentals — where I learned back-end discipline.",
            tech: ["Python", "FastAPI", "MongoDB"],
        },
    ]
    return (
        <section
            id="work"
            ref={(el) => {
                (sectionsRef.current[1] = el)
            }}
            className="py-32 lg:py-40 opacity-0"
        >
            <div className="flex items-end justify-between mb-14">
                <div>
                    <div className="text-[10.5px] font-mono text-muted-foreground tracking-[0.22em] uppercase mb-3">№ 02</div>
                    <h2 className="text-4xl sm:text-5xl font-light leading-none tracking-[-0.03em]">
                        Selected <span className="font-serif italic text-muted-foreground">experience</span>
                    </h2>
                </div>
                <div className="text-right font-mono text-[11px] tracking-[0.14em] text-muted-foreground leading-[1.8]">
                    2023 — Present
                    <br />
                    <span className="text-muted-foreground/60">{String(experiences.length).padStart(2, "0")} positions</span>
                </div>
            </div>

            <div>
                {experiences.map((job, index) => (
                    <div
                        key={index}
                        className="group grid grid-cols-[32px_80px_1fr] md:grid-cols-[32px_90px_1fr_180px] gap-x-6 gap-y-2 py-7 items-baseline border-t border-border last:border-b"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="font-mono text-[11px] text-muted-foreground/60 tabular-nums">
                            {String(index + 1).padStart(2, "0")}
                        </div>
                        <div className="font-mono text-[11px] text-muted-foreground tracking-[0.1em]">
                            {job.year}
                        </div>
                        <div className="col-span-1 md:col-auto">
                            <div className="text-base sm:text-[17px] font-medium tracking-[-0.005em] group-hover:text-accent transition-colors duration-300">
                                {job.role} <span className="text-muted-foreground font-normal">— {job.company}</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-[1.7] mt-2 max-w-[58ch]">
                                {job.description}
                            </p>
                        </div>
                        <div className="font-mono text-[10.5px] text-muted-foreground tracking-[0.06em] md:text-right col-start-3 md:col-start-4">
                            {job.tech.join(" · ")}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
