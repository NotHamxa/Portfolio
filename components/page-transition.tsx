"use client"

import { usePathname, useRouter } from "next/navigation"
import { createContext, useCallback, useContext, useEffect, useRef, useState, useTransition } from "react"

type TransitionState = "entering" | "visible" | "exiting"

const TransitionContext = createContext<{
    push: (href: string) => void
}>({ push: () => {} })

export function usePageTransition() {
    return useContext(TransitionContext)
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [state, setState] = useState<TransitionState>("entering")
    const [, startTransition] = useTransition()
    const pendingHref = useRef<string | null>(null)

    // Enter on mount / route change
    useEffect(() => {
        setState("entering")
        const t = setTimeout(() => setState("visible"), 20)
        return () => clearTimeout(t)
    }, [pathname])

    const push = useCallback((href: string) => {
        pendingHref.current = href
        setState("exiting")
    }, [])

    // Navigate after exit animation finishes
    useEffect(() => {
        if (state !== "exiting") return
        const t = setTimeout(() => {
            if (pendingHref.current) {
                startTransition(() => {
                    router.push(pendingHref.current!)
                })
                pendingHref.current = null
            }
        }, 400) // matches CSS duration
        return () => clearTimeout(t)
    }, [state, router, startTransition])

    // NOTE: at rest (visible), we deliberately don't apply transform/filter classes —
    // they create a containing block that breaks `position: fixed` for descendants.
    const className =
        state === "entering"
            ? "opacity-0 translate-y-3"
            : state === "exiting"
                ? "opacity-0 -translate-y-2"
                : "opacity-100"

    return (
        <TransitionContext.Provider value={{ push }}>
            <div className={`transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${className}`}>
                {children}
            </div>
        </TransitionContext.Provider>
    )
}
