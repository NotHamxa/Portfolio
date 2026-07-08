import { NextRequest, NextResponse } from 'next/server'
import { getTimeline, updateTimeline } from '@/lib/timelineDb'
import { isTimelineApiAuthorized } from '@/lib/timelineAuth'

// Public read of a single timeline.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const timeline = await getTimeline(slug)
    if (!timeline) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ id: timeline.id, title: timeline.title, show: timeline.show !== false, entries: timeline.entries ?? [] })
}

// Programmatic update — currently supports toggling visibility. Auth: Bearer TIMELINE_API_SECRET (or x-api-key).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    if (!isTimelineApiAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { slug } = await params
    const body = await req.json().catch(() => null) as { show?: boolean } | null

    if (typeof body?.show !== 'boolean') {
        return NextResponse.json({ error: 'Missing boolean "show"' }, { status: 400 })
    }

    const timeline = await updateTimeline(slug, { show: body.show })
    if (!timeline) return NextResponse.json({ error: 'Timeline not found' }, { status: 404 })

    return NextResponse.json({ success: true, id: timeline.id, show: timeline.show })
}
