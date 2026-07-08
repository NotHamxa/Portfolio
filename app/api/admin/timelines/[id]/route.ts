import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import { updateTimeline, deleteTimeline } from '@/lib/timelineDb'

async function requireAdmin(): Promise<boolean> {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
    return session.isAdmin === true
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    try {
        const { id } = await params
        const body = await req.json()
        const timeline = await updateTimeline(id, body)
        if (!timeline) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json(timeline)
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Internal server error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const ok = await deleteTimeline(id)
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
}
