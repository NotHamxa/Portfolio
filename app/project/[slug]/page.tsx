"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
export default function ProjectDetailPage() {
    const title = "Volt";
    const description = "This is a detailed description of my project...\n dsfhsdfuhdsiufhsdifu";
    const images = ["/images/img.png"];
    const downloadUrl = "https://example.com/download";
    const paragraphs = description.split(/\n+/)

    return (
        <div className="min-h-screen bg-background text-foreground px-6 sm:px-8 lg:px-24 py-16 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                <div className="space-y-3 sm:space-y-2">
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
                        {title}
                    </h1>
                </div>
                <Button asChild variant="outline"  className="flex items-center gap-2">
                    <a href={downloadUrl} download>
                        <Download className="w-4 h-4" />
                        Download
                    </a>
                </Button>
            </div>
            <div className="space-y-8 leading-relaxed text-lg">
                {paragraphs.map((para, idx) => (
                    <div key={idx} className="space-y-4 animate-fade-in-up">
                        <p>{para}</p>
                        {images[idx] && (
                            <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden shadow-md">
                                <Image
                                    src={images[idx]}
                                    alt={`Project image ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
