import { NextRequest, NextResponse } from 'next/server'
import { getTimelines, createTimeline } from '@/lib/timelineDb'
import { isTimelineApiAuthorized } from '@/lib/timelineAuth'
import { TimelineEntry } from '@/models/timelineContent'

// Public list of visible timelines.
export async function GET() {
    const timelines = await getTimelines()
    return NextResponse.json(
        timelines
            .filter(t => t.show !== false)
            .map(t => ({ id: t.id, title: t.title, entries: t.entries ?? [] }))
    )
}

// Programmatic timeline creation. Auth: Bearer TIMELINE_API_SECRET (or x-api-key).
export async function POST(req: NextRequest) {
    if (!isTimelineApiAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => null) as { title?: string; show?: boolean; entries?: TimelineEntry[] } | null

    const title = body?.title?.trim()
    if (!title) return NextResponse.json({ error: 'Missing "title"' }, { status: 400 })

    const entries: TimelineEntry[] = Array.isArray(body?.entries)
        ? body!.entries
            .filter(e => e && typeof e.note === 'string' && e.note.trim())
            .map(e => ({ date: (e.date ?? '').toString().trim() || new Date().toISOString().slice(0, 10), note: e.note.trim() }))
        : []

    const timeline = await createTimeline({
        title,
        entries,
        show: body?.show ?? true,
    })

    return NextResponse.json({ success: true, timeline })
}
