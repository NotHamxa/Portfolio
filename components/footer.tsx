import Link from "next/link";
import { Github, Linkedin, Sun, Moon } from "lucide-react";

interface Props {
    isDark: boolean;
    toggleTheme: () => void;
}

export default function Footer({ isDark, toggleTheme }: Props) {
    const iconCls =
        "w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"

    return (
        <footer className="pt-10 pb-12 border-t border-border">
            <div className="flex items-center justify-between gap-6">
                <span className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-muted-foreground">
                    © 2026
                </span>

                <div className="flex items-center gap-5">
                    <Link
                        href="https://github.com/NotHamxa"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                    >
                        <Github className={iconCls} strokeWidth={1.5} />
                    </Link>
                    <Link
                        href="https://linkedin.com/in/hamzahmed07"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                    >
                        <Linkedin className={iconCls} strokeWidth={1.5} />
                    </Link>
                    <span className="h-3 w-px bg-border" />
                    <button onClick={toggleTheme} aria-label="Toggle theme">
                        {isDark ? (
                            <Sun className={iconCls} strokeWidth={1.5} />
                        ) : (
                            <Moon className={iconCls} strokeWidth={1.5} />
                        )}
                    </button>
                </div>
            </div>
        </footer>
    )
}
