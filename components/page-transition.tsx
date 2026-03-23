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
        }, 300) // matches CSS duration
        return () => clearTimeout(t)
    }, [state, router, startTransition])

    const className =
        state === "entering"
            ? "opacity-0"
            : state === "exiting"
                ? "opacity-0"
                : "opacity-100"

    return (
        <TransitionContext.Provider value={{ push }}>
            <div className={`transition-all duration-300 ease-out ${className}`}>
                {children}
            </div>
        </TransitionContext.Provider>
    )
}
