"use client"

import {useEffect, useRef, useState} from "react"
import Header from "@/components/header";
import ContactSection from "@/sections/contact";
import ExperienceSection from "@/sections/experience";
import ProjectsSection from "@/sections/projects";
import { ArrowUp } from "lucide-react";

export default function Home() {
  const [activeSection, setActiveSection] = useState("")
  const [showScrollTop, setShowScrollTop] = useState(false)
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up")
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3, rootMargin: "0px 0px -20% 0px" },
    )

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })



  const navItems: { id: string; label: string }[] = [
    { id: "intro", label: "Intro" },
    { id: "work", label: "Work" },
    { id: "thoughts", label: "Projects" },
    { id: "connect", label: "Contact" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Sticky top nav — borderless, text-only */}
      <div className="sticky top-0 z-20 bg-background/75 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16 h-14 sm:h-16 flex items-center justify-between">
          <button
            onClick={() => document.getElementById("intro")?.scrollIntoView({ behavior: "smooth" })}
            className="flex items-center gap-2 sm:gap-3 font-mono text-[10.5px] tracking-[0.18em] sm:tracking-[0.22em] uppercase text-foreground"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
            <span className="hidden sm:inline">Hamza Ahmed</span>
            <span className="sm:hidden">Hamza</span>
          </button>
          <div className="flex gap-4 sm:gap-6 lg:gap-7 font-mono text-[10.5px] tracking-[0.18em] sm:tracking-[0.22em] uppercase">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })}
                className={`transition-colors duration-300 ${
                  activeSection === item.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-16">
          <Header sectionsRef={sectionsRef}/>
          <ExperienceSection sectionsRef={sectionsRef}/>
          <ProjectsSection sectionsRef={sectionsRef}/>
          <ContactSection sectionsRef={sectionsRef}/>
      </main>

      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`fixed bottom-8 right-8 z-50 w-10 h-10 rounded-full border border-border bg-background/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-all duration-300 ${
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <ArrowUp className="w-4 h-4" strokeWidth={1.5} />
      </button>

    </div>
  )
}
