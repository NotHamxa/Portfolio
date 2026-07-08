import { NextRequest, NextResponse } from 'next/server'
import { addTimelineEntry, getTimeline } from '@/lib/timelineDb'
import { isTimelineApiAuthorized } from '@/lib/timelineAuth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const timeline = await getTimeline(slug)
    if (!timeline || timeline.show === false) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ id: timeline.id, title: timeline.title, entries: timeline.entries ?? [] })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    if (!isTimelineApiAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { slug } = await params
    const body = await req.json().catch(() => null) as { date?: string; note?: string } | null

    const note = body?.note?.trim()
    if (!note) return NextResponse.json({ error: 'Missing "note"' }, { status: 400 })

    const date = body?.date?.trim() || new Date().toISOString().slice(0, 10)

    const timeline = await addTimelineEntry(slug, { date, note })
    if (!timeline) return NextResponse.json({ error: 'Timeline not found' }, { status: 404 })

    return NextResponse.json({ success: true, entry: { date, note }, entries: timeline.entries })
}
