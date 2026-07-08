import { notFound } from 'next/navigation'
import { getTimeline } from '@/lib/timelineDb'
import TimelineForm from '@/components/admin/TimelineForm'

export const dynamic = 'force-dynamic'

export default async function EditTimelinePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const timeline = await getTimeline(id, { fresh: true })
    if (!timeline) notFound()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Edit — {timeline.title}</h1>
            </div>
            <TimelineForm mode="edit" initial={timeline} />
        </div>
    )
}
