import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from '@/lib/session'
import { getTimelines, createTimeline, reorderTimelines } from '@/lib/timelineDb'

async function requireAdmin(): Promise<boolean> {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
    return session.isAdmin === true
}

export async function GET() {
    const timelines = await getTimelines({ fresh: true })
    return NextResponse.json(timelines)
}

export async function POST(req: NextRequest) {
    if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    const timeline = await createTimeline(body)
    return NextResponse.json(timeline)
}

export async function PATCH(req: NextRequest) {
    if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { ids } = await req.json()
    await reorderTimelines(ids)
    return NextResponse.json({ success: true })
}
