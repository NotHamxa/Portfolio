import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getTimeline, getTimelines } from '@/lib/timelineDb'
import TimelineClient from '@/components/TimelineClient'

export const revalidate = 3600

export async function generateStaticParams() {
    try {
        const timelines = await getTimelines()
        return timelines.filter(t => t.show !== false).map(t => ({ slug: t.id }))
    } catch {
        return []
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const timeline = await getTimeline(slug)
    if (!timeline) return { title: 'Not found' }
    return {
        title: `${timeline.title} — Progress — Hamza Ahmed`,
        description: `Progress log for ${timeline.title}.`,
    }
}

export default async function TimelinePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const timeline = await getTimeline(slug)
    if (!timeline || timeline.show === false) notFound()

    return <TimelineClient data={timeline} />
}
