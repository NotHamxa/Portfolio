"use client"

import { useEffect, useState } from "react"
import Footer from "@/components/footer"

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
    const [isDark, setIsDark] = useState(true)

    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDark)
    }, [isDark])

    const toggleTheme = () => setIsDark(!isDark)

    return (
        <>
            {children}
            <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16">
                <Footer isDark={isDark} toggleTheme={toggleTheme} />
            </div>
        </>
    )
}
