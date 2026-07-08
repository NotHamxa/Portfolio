"use client"

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function AdminNav() {
    const router = useRouter()
    const pathname = usePathname()

    async function handleLogout() {
        await fetch('/api/admin/logout', { method: 'POST' })
        router.push('/admin/login')
    }

    return (
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        ← Portfolio
                    </Link>
                    <nav className="flex items-center gap-4">
                        <Link
                            href="/admin/projects"
                            className={`text-sm transition-colors ${pathname.startsWith('/admin/projects') ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Projects
                        </Link>
                        <Link
                            href="/admin/timelines"
                            className={`text-sm transition-colors ${pathname.startsWith('/admin/timelines') ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Timelines
                        </Link>
                        <Link
                            href="/admin/media"
                            className={`text-sm transition-colors ${pathname.startsWith('/admin/media') ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Media
                        </Link>
                        <Link
                            href="/admin/telemetry"
                            className={`text-sm transition-colors ${pathname.startsWith('/admin/telemetry') ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Telemetry
                        </Link>
                    </nav>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                    Sign out
                </Button>
            </div>
        </header>
    )
}
